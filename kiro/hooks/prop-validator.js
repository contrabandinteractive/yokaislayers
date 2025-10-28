/**
 * Kiro Hook: Validate React component props match interfaces
 * Prevents prop drilling bugs
 */

module.exports = {
  name: 'prop-validator',
  trigger: 'on-save',
  pattern: /\.tsx$/,
  
  async execute(context) {
    const file = context.getCurrentFile();
    
    // Find interface definitions
    const interfaces = file.match(/interface\s+(\w+Props)\s*{([^}]+)}/g);
    
    // Find component definitions
    const components = file.match(/function\s+(\w+)\(\s*{\s*([^}]+)\s*}:\s*(\w+Props)/g);
    
    // Validate each component uses correct props
    for (const component of components || []) {
      const propsUsed = extractPropsUsed(component);
      const propsDefined = extractPropsDefined(interfaces, component);
      
      const missing = propsDefined.filter(p => !propsUsed.includes(p));
      if (missing.length > 0) {
        context.warn(`Component may not use props: ${missing.join(', ')}`);
      }
    }
  }
};