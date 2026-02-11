import subprocess
import sys
import os
import time
import threading
from pathlib import Path

# Get the base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# NLP pipeline scripts
nlp_scripts = [
    "nlp/employee_filter.py",
    "nlp/preprocess.py",
    "nlp/sentiment.py",
    "nlp/drift_detection.py"
]

def run_nlp_pipeline():
    """Run the NLP data processing pipeline"""
    print("\n" + "="*80)
    print("[STAGE 1] DATA PROCESSING PIPELINE")
    print("="*80 + "\n")

    for script in nlp_scripts:
        print(f"[RUN] Running {script} ...")
        
        result = subprocess.run(
            [sys.executable, script],
            capture_output=True,
            text=True,
            cwd=BASE_DIR
        )

        if result.returncode != 0:
            print(f"\n[ERROR] Error while running {script}")
            print(result.stderr)
            return False
        else:
            print(result.stdout)
    
    print("\n[SUCCESS] NLP Pipeline execution completed!\n")
    return True

def check_dependencies():
    """Check and install required dependencies"""
    print("\n" + "="*80)
    print("[STAGE 0] CHECKING DEPENDENCIES")
    print("="*80 + "\n")
    
    # Check Python dependencies
    try:
        import flask
        import flask_cors
        import pandas
    except ImportError:
        print("Installing Python dependencies...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements-api.txt"],
            capture_output=True,
            text=True,
            cwd=BASE_DIR
        )
        if result.returncode == 0:
            print("[SUCCESS] Python dependencies installed\n")
        else:
            print("[WARNING] Could not install Python dependencies")
            print(result.stderr)
    
    # Check Node dependencies
    react_frontend_path = os.path.join(BASE_DIR, "react-frontend")
    if os.path.exists(react_frontend_path):
        node_modules_path = os.path.join(react_frontend_path, "node_modules")
        if not os.path.exists(node_modules_path):
            print("Installing Node dependencies (this may take a minute)...")
            result = subprocess.run(
                "npm install",
                shell=True,
                capture_output=True,
                text=True,
                cwd=react_frontend_path
            )
            if result.returncode == 0:
                print("[SUCCESS] Node dependencies installed\n")
            else:
                print("[WARNING] Could not install Node dependencies")
                print("   Run manually: cd react-frontend && npm install")

def start_flask_api():
    """Start the Flask API server"""
    print("\n" + "="*80)
    print("[STAGE 2] STARTING FLASK API SERVER")
    print("="*80 + "\n")
    
    print("Starting Flask API on http://localhost:5000...")
    print("[WAIT] Waiting for API to initialize...\n")
    
    # Start Flask in a separate thread
    api_process = subprocess.Popen(
        [sys.executable, "api_server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=BASE_DIR
    )
    
    time.sleep(2)  # Give Flask time to start
    print("[SUCCESS] Flask API started\n")
    
    return api_process

def start_react_frontend():
    """Start the React frontend development server"""
    print("="*80)
    print("[STAGE 3] STARTING REACT FRONTEND")
    print("="*80 + "\n")
    
    react_frontend_path = os.path.join(BASE_DIR, "react-frontend")
    
    if not os.path.exists(react_frontend_path):
        print("[WARNING] React frontend not found at react-frontend/\n")
        return None
    
    # Check if node_modules exists
    node_modules_path = os.path.join(react_frontend_path, "node_modules")
    if not os.path.exists(node_modules_path):
        print("[INFO] Installing Node dependencies first...")
        install_result = subprocess.run(
            "npm install --legacy-peer-deps",
            shell=True,
            capture_output=True,
            text=True,
            cwd=react_frontend_path,
            timeout=120
        )
        if install_result.returncode != 0:
            print("[ERROR] Error installing Node dependencies:")
            print(install_result.stderr[:500])
            return None
        print("[SUCCESS] Node dependencies installed\n")
    
    print("Starting React frontend development server...")
    print("[WAIT] Waiting for frontend to compile...\n")
    
    try:
        # Start Vite with proper error handling
        frontend_process = subprocess.Popen(
            "npm run dev",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
            cwd=react_frontend_path
        )
        
        time.sleep(5)  # Give Vite time to start
        
        # Check if process started successfully
        if frontend_process.poll() is not None:
            print("[ERROR] React frontend failed to start")
            return None
        
        print("[SUCCESS] React frontend started\n")
        return frontend_process
    except Exception as e:
        print(f"[ERROR] Error starting frontend: {e}")
        return None

def main():
    print("\n" + "="*80)
    print("[EMPLOYEE BRAND PERCEPTION ANALYTICS - FULL STACK]")
    print("="*80 + "\n")
    
    # Check dependencies
    check_dependencies()
    
    # Run NLP pipeline
    if not run_nlp_pipeline():
        print("[FAILURE] Pipeline failed. Exiting.")
        return
    
    # Start Flask API
    api_process = start_flask_api()
    
    # Start React Frontend
    frontend_process = start_react_frontend()
    
    # Display final instructions
    print("="*80)
    print("[SUCCESS] ALL SYSTEMS RUNNING!")
    print("="*80)
    print("\n[DASHBOARD] Dashboard URL: http://localhost:5173")
    print("[API] API Server:    http://localhost:5000")
    print("[HEALTH] Health Check:  http://localhost:5000/api/health\n")
    
    print("Press Ctrl+C to stop all services\n")
    print("="*80 + "\n")
    
    # Keep the processes running
    try:
        while True:
            time.sleep(2)
            
            # Check if processes are still alive
            if api_process and api_process.poll() is not None:
                print("\n[ERROR] Flask API has STOPPED (Exit code: {})".format(api_process.returncode))
                # Try to get any output
                try:
                    stdout, stderr = api_process.communicate(timeout=1)
                    if stderr:
                        print("Error:", stderr[:500])
                except:
                    pass
            
            if frontend_process and frontend_process.poll() is not None:
                print("\n[ERROR] React frontend has STOPPED (Exit code: {})".format(frontend_process.returncode))
                # Try to get any output
                try:
                    stdout, stderr = frontend_process.communicate(timeout=1)
                    if stdout:
                        print("Output:", stdout[-500:])
                    if stderr:
                        print("Error:", stderr[-500:])
                except:
                    pass
    except KeyboardInterrupt:
        print("\n\n[STOP] Shutting down services...\n")
        
        # Terminate processes
        if api_process:
            api_process.terminate()
            try:
                api_process.wait(timeout=5)
            except:
                api_process.kill()
        
        if frontend_process:
            frontend_process.terminate()
            try:
                frontend_process.wait(timeout=5)
            except:
                frontend_process.kill()
        
        print("[SUCCESS] All services stopped\n")

if __name__ == "__main__":
    main()
