import sys
import os

if __name__ == "__main__":
    scons_dir = os.path.join(os.path.dirname(sys.executable), 'scons')
    sys.path.insert(0, scons_dir)
    import SCons.Script
    SCons.Script.main()