#!/usr/bin/env node

import { sconsSync } from './dist/index.js';

try {
	sconsSync(process.argv.slice(2), {
    stdio: 'inherit'
  });
} catch (error) {
	process.exit(error.status);
}
