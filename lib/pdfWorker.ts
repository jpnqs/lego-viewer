import { pdfjs } from "react-pdf";
import { PDF_WORKER_SRC } from "@/config/experience";

pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
