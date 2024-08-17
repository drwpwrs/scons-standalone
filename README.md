# SCons Standalone

A set of standalone [SCons](https://github.com/SCons/scons) executables built with [PyInstaller](https://github.com/pyinstaller/pyinstaller).

Requires a JavaScript runtime such as [Node.js](https://nodejs.org) or [Bun](https://bun.sh) for detecting and extracting the platform-specific executable.

## Why?

This exists mostly so that I can bundle SCons into JS-based tools without the end user having to worry about Python.

It's not offically supported, nor is it affiliated with or endorsed by the SCons team, but feel free to use it in your own projects.

## Installation

```bash
(npm|yarn|pnpm|bun) install -g scons-standalone
```

## Usage

After installation, you can use SCons just like you would normally:

```bash
scons [options...] [name=val...] [targets...]
```

For more information on SCons usage, please refer to the [SCons documentation](https://scons.org/doc/production/HTML/scons-user.html).

## License

This project is licensed under the MIT License - see the [SCons license](https://github.com/SCons/scons/blob/master/LICENSE) for details.

## Contributing

Feel free to submit a Pull Request.
