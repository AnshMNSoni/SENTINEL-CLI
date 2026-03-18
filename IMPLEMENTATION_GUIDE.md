# Enhanced Sentinel CLI - Implementation Guide

## Overview

This document describes three major improvements to Sentinel Security CLI that address the gaps identified in the feature analysis:

1. **Enhanced File Operations API** - Proper diff-based editing replacing regex parsing
2. **Real Embeddings for RAG & Semantic Search** - Replacing fake SHA-256 vector generation
3. **Language-Specific Agent Framework** - Multi-language support with Tree-sitter hooks

---

## 1. Enhanced File Operations API

### Problem Solved

❌ **Before:**
- File writing used fragile regex-based parsing
- No diff previews before applying changes
- No batch operations for multiple files
- No support for symlinks, permissions, or file watching

✅ **After:**
- LSP-like protocol for safe, verifiable edits
- Diff preview to review changes before applying
- Batch operations with error handling
- Full file permission and symlink support

### Core Components

#### `EnhancedFileOperations` Class

**Location:** `src/utils/enhancedFileOperations.js`

Main API for all file operations with these categories:

**Basic Operations:**
```javascript
const fileOps = new EnhancedFileOperations('/project');

// Read file
const { content, size, modified } = await fileOps.read('src/app.js');

// Write file (creates parent directories automatically)
await fileOps.write('src/new-file.js', 'export default {}');

// File stats
const stats = await fileOps.stat('src/app.js');

// Check existence
const exists = await fileOps.exists('src/app.js');

// List directory
const items = await fileOps.list('src');

// Globe matching
const files = await fileOps.glob('**/*.{js,ts}');

// Delete
await fileOps.delete('src/old-file.js');

// Copy/Move
await fileOps.copy('src/old.js', 'src/new.js');
await fileOps.move('src/old.js', 'src/new.js');
```

**Diff-Based Editing (Most Important):**
```javascript
// Preview changes before applying
const preview = await fileOps.replaceString(
  'src/util.js',
  'const oldName =',
  'const newName =',
  { preview: true }  // Don't write yet
);

console.log(preview.diff);     // See exact changes
console.log(preview.summary);  // Change statistics

// Apply changes (remove preview flag)
await fileOps.replaceString(
  'src/util.js',
  'const oldName =',
  'const newName ='
);
```

**Batch Operations:**
```javascript
// Apply same changes to multiple files
const result = await fileOps.batchEdit(
  '**/*.js',  // File pattern
  [
    new TextEdit(null, null, 'oldFunction', 'newFunction')
  ],
  { preview: false }
);

console.log(`${result.successful} / ${result.filesProcessed} files updated`);

// Different edits per file
const changes = {
  'src/module1.js': [new TextEdit(null, null, 'foo', 'bar')],
  'src/module2.js': [new TextEdit(null, null, 'baz', 'qux')]
};

await fileOps.batchEditMultiple(changes);
```

**Permissions & Symlinks:**
```javascript
// Change file permissions (chmod)
await fileOps.chmod('scripts/deploy.sh', 0o755);  // Make executable

// Create symlink
await fileOps.createSymlink('src/config.js', 'config.js');

// Read symlink
const link = await fileOps.readSymlink('config.js');
console.log(link.resolved);  // Real path
```

**File Watching:**
```javascript
// Auto-trigger on file changes
const watcher = await fileOps.watch('src', (change) => {
  console.log(`${change.event}: ${change.file}`);
  // Trigger re-analysis
});

// Stop watching
watcher.unwatch();

// Clean up all watchers
fileOps.closeAllWatchers();
```

### Integration with UniversalAgent

Update `src/agents/universalAgent.js` to use `EnhancedFileOperations`:

```javascript
import { EnhancedFileOperations } from '../utils/enhancedFileOperations.js';

class UniversalAgent {
  constructor() {
    this.fileOps = new EnhancedFileOperations();
  }

  async executeWrite(command, args) {
    // Old: regex-based parsing
    // const match = command.match(/write "(.*)" "(.*)"/)
    
    // New: proper argument parsing
    const { filePath, content } = args;
    return this.fileOps.write(filePath, content);
  }

  async executeReplace(oldString, newString, options = {}) {
    return this.fileOps.replaceString(
      options.file,
      oldString,
      newString,
      { preview: options.preview }
    );
  }
}
```

---

## 2. Multi-File Refactoring Engine

### Problem Solved

❌ **Before:**
- Cannot rename functions/variables across multiple files
- No way to refactor imports when moving files
- Cannot extract code into new functions reliably

✅ **After:**
- AST-aware refactoring with fallback to regex
- Multi-file refactoring with diff previews
- Safe import update when files move
- Function extraction and renaming

### Core Components

#### `RefactoringEngine` Class

**Location:** `src/utils/refactoringEngine.js`

```javascript
import { RefactoringEngine } from './utils/refactoringEngine.js';

const refactor = new RefactoringEngine('/project');

// Rename function across codebase
await refactor.renameFunction(
  'useFetchData',      // old name
  'useApiRequest',     // new name
  {
    filePattern: '**/*.{ts,tsx}',
    preview: true      // Preview first
  }
);

// Rename class
await refactor.renameClass('DatabaseClient', 'DatabaseConnection');

// Rename variable (with scope limitations)
await refactor.renameVariable('config', 'appConfig');

// Extract function
await refactor.extractFunction(
  'const result = process(data); return result;',
  'processData',
  'src/utils/processor.js',
  {
    parameters: [{ name: 'data' }],
    preview: true
  }
);

// Update imports when file moves
await refactor.updateImportsForMove(
  'src/old/component.tsx',
  'src/components/MyComponent.tsx',
  { preview: true }
);
```

### Architecture

```
RefactoringEngine
├─ renameFunction()       → Find all references + apply changes
├─ renameClass()          → Class definition + instantiation
├─ renameVariable()       → Simple word boundary matching
├─ extractFunction()      → Create new function + call
├─ updateImportsForMove() → Relative path adjustment
└─ preview()              → Review before applying

  Each method returns RefactoringOperation
  ├─ Changes Map (file → edits)
  ├─ apply(fileOps)  → Execute changes
  └─ summary()       → Stats (lines changed, files affected)
```

### Future Improvements

**Phase 2:** Integrate with Tree-sitter for precise AST-based refactoring:

```javascript
// Will become possible after tree-sitter is integrated
const refactor = new RefactoringEngine('/project', {
  useAST: true,  // Use tree-sitter instead of regex
  language: 'javascript'
});

// More reliable refactoring without false positives
await refactor.renameFunction('Component', 'MyComponent');
```

---

## 3. Real Embeddings for RAG & Semantic Search

### Problem Solved

❌ **Before:**
```javascript
// BROKEN: Fake embeddings using SHA-256 hashes
const hash = crypto.createHash('sha256').update(text).digest();
const vector = Array.from(hash.slice(0, 32), byte => byte / 255);
// Vector: [0.43, 0.22, 0.88, ...] — meaningless for similarity
```

✅ **After:**
- Real embeddings from OpenAI, local TF-IDF, or custom providers
- Meaningful similarity scores for code search
- Proper RAG/retrieval-augmented generation

### Core Components

#### `EmbeddingProvider` Hierarchy

**Location:** `src/utils/embeddingProvider.js`

**Factory Pattern:**
```javascript
import { EmbeddingProvider } from './utils/embeddingProvider.js';

// Option 1: OpenAI (requires API key)
const openaiProvider = await EmbeddingProvider.create('openai', {
  model: 'text-embedding-ada-002',
  apiKey: process.env.OPENAI_API_KEY
});

// Option 2: Local TF-IDF (no dependencies, offline)
const tfidfProvider = await EmbeddingProvider.create('tfidf', {
  vocabularySize: 384  // Dimension of vectors
});

// Option 3: Local sentence-transformers (if installed)
const localProvider = await EmbeddingProvider.create('local', {
  model: 'all-MiniLM-L6-v2'
});
```

**Usage:**
```javascript
// Single embedding
const vector1 = openaiProvider.generateEmbedding(
  'function process(data) { return transform(data); }'
);

const vector2 = openaiProvider.generateEmbedding(
  'const result = data.map(x => x * 2);'
);

// Batch processing
const vectors = await openaiProvider.generateBatchEmbeddings([
  'code 1',
  'code 2',
  'code 3'
]);

// Similarity metrics
import { cosineSimilarity, euclideanDistance } from './utils/embeddingProvider.js';

const similarity = cosineSimilarity(vector1, vector2);
console.log(`Similarity: ${similarity}`);  // 0.72 (high match)

const distance = euclideanDistance(vector1, vector2);
console.log(`Distance: ${distance}`);      // 0.31 (similar)
```

**Provider Comparison:**

| Provider | Quality | Speed | Dependencies | Cost |
|----------|---------|-------|--------------|------|
| OpenAI   | ⭐⭐⭐⭐⭐ | 🟡 (API) | None | $ per 1000 |
| Local    | ⭐⭐⭐⭐ | ⭐⭐⭐ | sentence-transformers | Free |
| TF-IDF   | ⭐⭐⭐ | ⭐⭐⭐⭐ | None | Free |

### Integration: Semantic Code Search

**Updated `src/search/semanticCodeSearch.js`:**

```javascript
// Now uses real embeddings instead of fake SHA-256 hashes
async getEmbedding(text) {
  if (!this.embeddingProvider) {
    const { EmbeddingProvider } = await import('./embeddingProvider.js');
    this.embeddingProvider = await EmbeddingProvider.create(
      this.options.provider || 'tfidf'
    );
  }

  return this.embeddingProvider.generateEmbedding(text);
}

// Usage
const search = new SemanticCodeSearch('/project');
await search.indexCodebase();

const results = await search.search('parse JSON data');
// ✅ Now returns meaningful similarity scores
```

### Integration: RAG Pipeline

**Updated `src/rag/ragPipeline.js`:**

```javascript
// RAG now uses real embeddings for retrieval
const rag = new RAGPipeline({
  embeddingProvider: 'tfidf'  // Changed from broken internal system
});

await rag.initialize();  // Initializes embedding provider

// Query with proper retrieval
const answer = await rag.query('How do we validate user input?', {
  topK: 5
});

// ✅ Results are ranked by actual semantic similarity
```

---

## 4. Language-Specific Agent Framework

### Problem Solved

❌ **Before:**
- Python agent is just a stub
- Go analyzer uses regex only
- No Rust/Kotlin/Java support
- No code generation or intelligent refactoring

✅ **After:**
- Full framework for multi-language support
- Tree-sitter integration (with Babel fallback for JS)
- Code generation from specifications
- Language-aware linting and refactoring

### Core Components

#### Language Agents

**Location:** `src/agents/languageAgents.js`

```javascript
import { getLanguageAgent } from './agents/languageAgents.js';

const jsAgent = await getLanguageAgent('javascript');
const pyAgent = await getLanguageAgent('python');
const rustAgent = await getLanguageAgent('rust');
```

**Supported Operations:**

```javascript
// 1. PARSING - with AST
const parseResult = await jsAgent.parse(code);
// Returns: { type: 'tree-sitter' or 'babel', tree, success }

// 2. ANALYSIS - extract structure
const analysis = await jsAgent.analyze(code);
// Returns:
// {
//   functions: [{name, params, async, line}],
//   classes: [{name, methods, line}],
//   imports: [{source, specifiers}],
//   exports: [...],
//   errors: [...]
// }

// 3. LINTING - find issues
const issues = await jsAgent.lint(code);
// Returns: [{type, message, severity}]

// 4. GENERATION - create code
const generated = await jsAgent.generate({
  type: 'function',
  name: 'validateEmail',
  params: ['email'],
  body: '...'
});
// Returns: Generated function code

// 5. REFACTORING - transform AST
const refactored = await jsAgent.refactor(code, {
  type: 'rename-function',
  oldName: 'foo',
  newName: 'bar'
});
```

### Language-Specific Features

#### JavaScript/TypeScript

```javascript
const jsAgent = await getLanguageAgent('typescript');

// Uses Tree-sitter first (if available), falls back to Babel
const analysis = await jsAgent.analyze(`
  interface User {
    name: string;
    email: string;
  }

  class UserService {
    async getUser(id: string): Promise<User> {
      return fetch(\`/api/users/\${id}\`).then(r => r.json());
    }
  }
`);

console.log(analysis.analysis.classes);  // [{ name: 'UserService', ... }]
console.log(analysis.analysis.imports);  // []
```

**Transformations:**
- `rename-function` - Rename function declarations and calls
- `extract-function` - Extract code block into function
- `convert-var-let` - Convert `var` to `let`

#### Python

```javascript
const pyAgent = await getLanguageAgent('python');

const analysis = await pyAgent.analyze(`
  def validate_email(email: str) -> bool:
      return '@' in email

  class EmailValidator:
      pass
`);

console.log(analysis.analysis.functions);  // [{ name: 'validate_email', ... }]
```

#### Rust

```javascript
const rustAgent = await getLanguageAgent('rust');

const analysis = await rustAgent.analyze(`
  fn main() {
      println!("Hello");
  }

  struct User {
      name: String,
      age: u32,
  }
`);

const issues = await rustAgent.lint(`
  fn process() {
      unsafe {
          // ...
      }
  }
`);
// Detects: unsafe block, suggests better error handling
```

### Architecture

```
LanguageAgent (base)
├─ JavaScriptAgent
│  ├─ useTreeSitter (if available) → tree-sitter-javascript
│  ├─ fallback → @babel/parser
│  └─ operations: parse, analyze, lint, generate, refactor
│
├─ PythonAgent
│  ├─ tree-sitter-python
│  └─ operations: parse, analyze, lint, generate
│
├─ RustAgent
│  ├─ tree-sitter-rust
│  └─ operations: parse, analyze, lint, generate
│
└─ [Future] KotlinAgent, SwiftAgent, JavaAgent...
   └─ Extensible for new languages
```

### Usage in Multi-Agent Orchestrator

**Update `src/agents/multi_agent_orchestrator.js`:**

```javascript
import { getLanguageAgent } from './languageAgents.js';

class MultiAgentOrchestrator {
  async analyzeCode(code, language = 'javascript') {
    // Use language-specific agent for better accuracy
    const agent = await getLanguageAgent(language);
    
    const analysis = await agent.analyze(code);
    const lintIssues = await agent.lint(code);

    return {
      structure: analysis.analysis,
      issues: lintIssues.issues,
      language: language
    };
  }

  async generateFix(code, language, issue) {
    const agent = await getLanguageAgent(language);

    // Generate language-appropriate fix
    const fix = await agent.refactor(code, {
      type: 'fix-issue',
      issue: issue
    });

    return fix;
  }
}
```

---

## 5. Installation & Dependencies

### Optional Dependencies

To use all features, install these packages:

```bash
# For better embedding models
npm install sentence-transformers  # For local embeddings

# For Tree-sitter parsing (optional but recommended)
npm install tree-sitter
npm install tree-sitter-javascript
npm install tree-sitter-python
npm install tree-sitter-rust

# For OpenAI embeddings
npm install openai
```

### Core Dependencies (Already Used)

- `diff` - For diff generation ✅
- `glob` - For file globbing ✅
- `fs` / `fs/promises` - Node.js standard ✅

---

## 6. Migration Guide

### For UniversalAgent / ModernTUI

**Before:**
```javascript
// Fragile regex-based write
async handleWrite(command) {
  const match = command.match(/^write\s+"([^"]+)"\s+"(.+)$/);
  // Breaks with special characters, newlines, quotes
}
```

**After:**
```javascript
// Proper API
async handleWrite(filePath, content) {
  const fileOps = new EnhancedFileOperations();
  return fileOps.write(filePath, content);
}
```

### For Semantic Search / RAG

**Before:**
```javascript
// Fake embeddings
const embedding = crypto.createHash('sha256').update(text).digest();
// Complete garbage for similarity matching
```

**After:**
```javascript
const provider = await EmbeddingProvider.create('tfidf');
const embedding = provider.generateEmbedding(text);
// Proper semantic vector
```

### For Language-Specific Analysis

**Before:**
```javascript
// analyzeGo() was just regex patterns
const checks = [
  { type: 'GoRisk', message: 'md5 hashing', re: /md5\.New\s*\(/ }
];
```

**After:**
```javascript
const goAgent = await getLanguageAgent('go');
const analysis = await goAgent.analyze(code);
const issues = await goAgent.lint(code);
// Proper AST-based analysis
```

---

## 7. Testing

### Unit Tests

```javascript
// tests/file-operations.test.js
import {
  EnhancedFileOperations,
  TextEdit,
  Range
} from '../src/utils/enhancedFileOperations.js';

describe('EnhancedFileOperations', () => {
  it('should preview changes without writing', async () => {
    const fileOps = new EnhancedFileOperations(tempDir);
    
    const result = await fileOps.replaceString(
      'test.js',
      'old',
      'new',
      { preview: true }
    );

    expect(result.preview).toBe(true);
    expect(result.diff).toBeDefined();
  });

  it('should batch edit multiple files', async () => {
    const result = await fileOps.batchEdit(
      '**/*.js',
      [new TextEdit(null, null, 'foo', 'bar')]
    );

    expect(result.filesProcessed).toBeGreaterThan(0);
  });
});
```

---

## 8. Performance Tips

1. **Use TF-IDF embeddings** for offline code analysis (no API calls)
2. **Cache embeddings** to avoid regenerating for same text
3. **Batch operations** instead of individual file writes
4. **Use file watching** for auto-triggers instead of polling
5. **Lazy-load language agents** only when needed

---

## 9. Roadmap

### Phase 1: ✅ Core Implementation (Done)
- Enhanced file operations
- Real embeddings
- Language agent framework

### Phase 2: AST Integration (3-6 months)
- Tree-sitter integration for all languages
- AST-aware refactoring
- Better multi-file rename handling

### Phase 3: Learning & Optimization (6-12 months)
- Agent learning from feedback
- Performance metrics tracking
- Caching strategies

### Phase 4: Ecosystem (12+ months)
- IDE plugins (VS Code, WebStorm)
- Cloud-based vector database
- Custom embedding fine-tuning

---

## 10. API Reference

See [Complete API Reference](./API_REFERENCE.md) for detailed documentation.

## 11. Examples

See [Usage Examples](./examples/usage-examples.js) for code samples.

---

## Questions?

Open an issue or contribute improvements! This framework is designed to be extensible and maintainable.
