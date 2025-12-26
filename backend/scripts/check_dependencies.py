"""
Script to check and audit dependencies for security vulnerabilities.
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, '', str(e)

def check_python_dependencies():
    """Check Python dependencies for security issues."""
    print("Checking Python dependencies...")
    backend_dir = Path(__file__).parent.parent
    
    # Check with safety (if installed)
    success, output, error = run_command(
        'safety check --json',
        cwd=backend_dir
    )
    
    if success:
        print("✓ Safety check passed")
    else:
        print("⚠ Safety check failed or not installed")
        print("Install with: pip install safety")
        print("Then run: safety check")
    
    # Check with pip-audit (if installed)
    success, output, error = run_command(
        'pip-audit --format json',
        cwd=backend_dir
    )
    
    if success:
        print("✓ pip-audit check passed")
    else:
        print("⚠ pip-audit check failed or not installed")
        print("Install with: pip install pip-audit")
        print("Then run: pip-audit")

def check_node_dependencies():
    """Check Node.js dependencies for security issues."""
    print("\nChecking Node.js dependencies...")
    frontend_dir = Path(__file__).parent.parent.parent / 'frontend'
    
    # Check with npm audit
    success, output, error = run_command(
        'npm audit --json',
        cwd=frontend_dir
    )
    
    if success:
        print("✓ npm audit completed")
        # Parse JSON output if needed
    else:
        print("⚠ npm audit failed")
        print(error)

def main():
    """Main function."""
    print("Dependency Security Audit")
    print("=" * 50)
    
    check_python_dependencies()
    check_node_dependencies()
    
    print("\n" + "=" * 50)
    print("Audit complete. Review any warnings above.")

if __name__ == '__main__':
    main()

