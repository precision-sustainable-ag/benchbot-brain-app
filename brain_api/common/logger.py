import logging
from datetime import date
from from_root import from_here
from pathlib import Path
import time

# create directory for storing all logs
log_dir = from_here("logs")
Path(log_dir).mkdir(parents=True, exist_ok=True)

# create log files
log_file_path = log_dir / f"Logs_{date.today()}.log"
be_logfile = str(log_file_path)
logging.basicConfig(filename=be_logfile, filemode="a", format="[ %(asctime)s ] [ %(levelname)s ] %(message)s ", datefmt="%m-%d-%y %H:%M:%S", level=logging.INFO)

def Info(message):
    logging.info(message)
    
def Error(message):
    logging.error(message)
