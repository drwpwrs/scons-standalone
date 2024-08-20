import sys
import os

if __name__ == "__main__":
    # Check if we're in a PyInstaller bundle
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # If we are, SCons should already be in sys.path
        import SCons.Script
    else:
        # If we're not, assume we're in a development environment
        scons_dir = os.path.join(os.path.dirname(sys.executable), 'scons')
        sys.path.insert(0, scons_dir)
        import SCons.Script
    
    SCons.Script.main()