/**
 * Kiro Hook: Auto-document development decisions
 * Creates a journal of how Kiro was used
 */

module.exports = {
  name: 'dev-journal',
  trigger: 'on-kiro-command',
  
  async execute(context) {
    const command = context.getCommand();
    const timestamp = new Date().toISOString();
    const files = context.getModifiedFiles();
    
    const entry = `
## ${timestamp}

### Command
\`\`\`
${command}
\`\`\`

### Generated Files
${files.map(f => `- ${f}`).join('\n')}

### Impact
${await analyzeImpact(files)}

---
`;
    
    await context.appendFile('.kiro/DEVELOPMENT_JOURNAL.md', entry);
  }
};