import { Buffer } from 'node:buffer';
import type {
	ChildProcess,
	ExecFileOptionsWithBufferEncoding,
	ExecFileOptionsWithStringEncoding,
	PromiseWithChild,
} from 'node:child_process';
import { scons, sconsSync } from '../../dist/index';

// Compile this consumer without executing SCons. Keep both supported output
// kinds and the async child's handle in the emitted public contract.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
	(<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type Output = Buffer | string;
type Result = { stdout: Output; stderr: Output };

const syncDefault = sconsSync([]);
const syncText = sconsSync([], { encoding: 'utf8' });
const syncBuffer = sconsSync([], { encoding: 'buffer' });
type SyncDefault = Expect<Equal<typeof syncDefault, Output>>;
type SyncText = Expect<Equal<typeof syncText, Output>>;
type SyncBuffer = Expect<Equal<typeof syncBuffer, Output>>;
if (Buffer.isBuffer(syncDefault)) {
	const output: Buffer = syncDefault;
	output.readUInt8(0);
}
if (typeof syncText === 'string') {
	syncText.toUpperCase();
}

const asyncDefault = scons([]);
const textOptions: ExecFileOptionsWithStringEncoding = { encoding: 'utf8' };
const bufferOptions: ExecFileOptionsWithBufferEncoding = { encoding: 'buffer' };
const asyncText = scons([], textOptions);
const asyncBuffer = scons([], bufferOptions);
type AsyncDefault = Expect<Equal<typeof asyncDefault, PromiseWithChild<Result>>>;
type AsyncText = Expect<Equal<typeof asyncText, PromiseWithChild<Result>>>;
type AsyncBuffer = Expect<Equal<typeof asyncBuffer, PromiseWithChild<Result>>>;
const child: ChildProcess = asyncDefault.child;
child.kill;
asyncDefault.then(({ stdout, stderr }) => {
	if (Buffer.isBuffer(stdout)) {
		const output: Buffer = stdout;
		output.readUInt8(0);
	}
	if (typeof stderr === 'string') {
		stderr.toUpperCase();
	}
});
