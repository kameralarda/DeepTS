import path from 'path';

// Set up Node.js module paths
process.env.NODE_PATH = path.join(__dirname, '../node_modules');
require('module').Module._initPaths();

// Import and run the main application
import './main'; 