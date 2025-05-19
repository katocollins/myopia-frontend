// src/pages/Doctor/DiagnosisDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Eye,
  Activity,
} from "lucide-react";
import { useDiagnosisStore } from "../../stores/diagnosisStore";
import { useUiStore } from "../../stores/uiStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DiagnosisDetails = () => {
  const { diagnosisId } = useParams();
  const navigate = useNavigate();
  const { selectedDiagnosis, recommendations, getDiagnosis, generateRecommendation } =
    useDiagnosisStore();
  const { isLoading, showToast } = useUiStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("images");

  // Helper function for severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  // Improved function to load image as base64
const loadImageAsBase64 = async (url) => {
  try {
    console.log(`Attempting to fetch image from: ${url}`);
    const response = await fetch(url, { 
      mode: "cors",
      cache: "no-cache" // Prevent caching issues
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image. Status: ${response.status}`);
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Image load error:", error);
    return null;
  }
};

  // Generate PDF report with enhanced structure and image handling
const generateReport = async () => {
  setIsGeneratingReport(true);
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Helper function to check if we need a new page
    const checkForNewPage = (neededSpace) => {
      if (y + neededSpace > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Report Header with styling
    doc.setFillColor("#4F46E5"); // Indigo color for header background
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Myopia Diagnosis System", margin, 25);
    doc.setFontSize(14);
    doc.text("Diagnosis Report", margin, 35);

    // Document metadata
    doc.setProperties({
      title: "Myopia Diagnosis Report",
      subject: `Patient: ${selectedDiagnosis.retinalImageId?.patientId?.name || "Unknown"}`,
      creator: "Myopia Diagnosis System",
      author: "Doctor",
      keywords: "myopia, diagnosis, medical report"
    });

    y = 50;

    // Report info box
    doc.setDrawColor("#4F46E5");
    doc.setFillColor("#EEF2FF"); // Light indigo background
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#111827");
    doc.text(`Generated on: ${formatDate(new Date())}`, margin + 5, y + 10);
    doc.text(`Severity: ${selectedDiagnosis.severityLevel?.toUpperCase() || "UNKNOWN"}`, margin + 5, y + 20);
    
    // Add severity indicator
    const severityColorMap = {
      severe: "#FEE2E2", // red-100
      high: "#FFEDD5", // orange-100
      medium: "#FEF3C7", // yellow-100
      low: "#DBEAFE", // blue-100
      normal: "#D1FAE5", // green-100
    };
    const severityColor = severityColorMap[selectedDiagnosis.severityLevel?.toLowerCase()] || "#F3F4F6";
    doc.setFillColor(severityColor);
    doc.roundedRect(pageWidth - margin - 50, y + 10, 45, 12, 6, 6, "F");
    doc.setTextColor("#111827");
    doc.setFont("helvetica", "bold");
    doc.text(selectedDiagnosis.severityLevel?.toUpperCase() || "UNKNOWN", pageWidth - margin - 47, y + 18);
    
    y += 40;

    // Patient Info Section
    doc.setFillColor("#F9FAFB"); // Gray-50
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#111827");
    doc.text("Patient Information", margin + 5, y + 12);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Name: ${selectedDiagnosis.retinalImageId?.patientId?.name || "Unknown"}`, margin + 10, y + 25);
    doc.text(`ID: ${selectedDiagnosis.retinalImageId?.patientId?._id || "N/A"}`, margin + 10, y + 35);
    doc.text(`Diagnosis Date: ${formatDate(selectedDiagnosis.diagnosedAt)}`, margin + 10, y + 45);
    
    y += 60;

    // Diagnosis Details
    doc.setFillColor("#F9FAFB"); // Gray-50
    checkForNewPage(80);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 80, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Diagnosis Details", margin + 5, y + 12);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Clinical Notes:", margin + 10, y + 25);
    
    // Handle multiline notes
    const notes = selectedDiagnosis.notes || "No notes provided";
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 2 * margin - 20);
    doc.text(splitNotes, margin + 10, y + 35);
    
    y += 90;

    // YOLO Detections Section
    checkForNewPage(120);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("YOLO Detections", margin, y);
    doc.setDrawColor("#4F46E5");
    doc.setLineWidth(0.5);
    doc.line(margin, y + 5, margin + 80, y + 5);
    y += 15;

    if (selectedDiagnosis.yoloDetections.length > 0) {
      // YOLO detection table
      autoTable(doc, {
        startY: y,
        head: [["Label", "Confidence (%)", "Bounding Box"]],
        body: selectedDiagnosis.yoloDetections.map((det) => [
          det.label,
          (det.confidence * 100).toFixed(1),
          `x: ${det.boundingBox.x.toFixed(2)}, y: ${det.boundingBox.y.toFixed(2)}, w: ${det.boundingBox.width.toFixed(2)}, h: ${det.boundingBox.height.toFixed(2)}`,
        ]),
        theme: "striped",
        headStyles: { 
          fillColor: "#4F46E5", 
          textColor: "#FFFFFF",
          fontStyle: "bold" 
        },
        alternateRowStyles: {
          fillColor: "#F9FAFB"
        },
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 5
        }
      });
      y = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6B7280"); // Gray-500
      doc.text("No YOLO detections available", margin, y);
      y += 15;
    }

    // Recommendations Section
    checkForNewPage(80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#111827");
    doc.text("AI Recommendations", margin, y);
    doc.setDrawColor("#4F46E5");
    doc.line(margin, y + 5, margin + 80, y + 5);
    y += 15;

    if (diagnosisRecommendations.length > 0) {
      diagnosisRecommendations.forEach((rec, index) => {
        const estimatedHeight = 40; // Approximate height needed for each recommendation
        checkForNewPage(estimatedHeight);
        
        doc.setFillColor("#EEF2FF"); // Light indigo for recommendation box
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Recommendation ${index + 1}:`, margin + 5, y + 7);
        y += 15;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(rec.recommendationText, pageWidth - 2 * margin - 10);
        doc.text(splitText, margin + 5, y);
        y += splitText.length * 5 + 5;
        
        doc.setFontSize(8);
        doc.setTextColor("#6B7280"); // Gray-500
        doc.text(`Generated: ${formatDate(rec.createdAt)}`, margin + 5, y);
        y += 10;
        doc.setTextColor("#111827");
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6B7280"); // Gray-500
      doc.text("No recommendations available", margin, y);
      y += 15;
    }

    // Add a new page for images
    doc.addPage();
    y = margin;

    // Images Section - Original Image
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#111827");
    doc.text("Original Retinal Image", margin, y);
    doc.setDrawColor("#4F46E5");
    doc.line(margin, y + 5, margin + 100, y + 5);
    y += 15;

    const originalImageUrl = `${import.meta.env.VITE_IMAGE_BASE_URL}/${selectedDiagnosis.retinalImageId.originalImagePath}?t=${Date.now()}`;
    const originalImageData = await loadImageAsBase64(originalImageUrl);
    
    if (originalImageData) {
      // Calculate image dimensions to fit on page while maintaining aspect ratio
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = 100; // Adjust based on your needs
      
      doc.addImage(originalImageData, "JPEG", margin, y, imgWidth, imgHeight);
      y += imgHeight + 20;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6B7280");
      doc.text("Original image not available", margin, y);
      y += 15;
    }

    // YOLO Output Image
    checkForNewPage(130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#111827");
    doc.text("YOLO Detection Image", margin, y);
    doc.setDrawColor("#4F46E5");
    doc.line(margin, y + 5, margin + 100, y + 5);
    y += 15;

    if (selectedDiagnosis.retinalImageId.yoloOutputPath) {
      const yoloImageUrl = `https://collinz56-myopia-yolo.hf.space/static/${selectedDiagnosis.retinalImageId.yoloOutputPath.split("/").pop()}?t=${Date.now()}`;
      const yoloImageData = await loadImageAsBase64(yoloImageUrl);
      
      if (yoloImageData) {
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = 100; // Adjust based on your needs
        
        doc.addImage(yoloImageData, "JPEG", margin, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor("#6B7280");
        doc.text("YOLO output image not available", margin, y);
        y += 15;
      }
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6B7280");
      doc.text("No YOLO output image available", margin, y);
      y += 15;
    }

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add footer background
      doc.setFillColor("#F3F4F6"); // Gray-100
      doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
      
      // Add footer text
      doc.setFontSize(8);
      doc.setTextColor("#4B5563"); // Gray-600
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${pageCount} | Generated by Myopia Diagnosis System | ${new Date().toLocaleString()}`,
        margin, 
        pageHeight - 10
      );
      
      // Add watermark/logo text in top right of each page
      doc.setFontSize(8);
      doc.setTextColor("#9CA3AF"); // Gray-400
      doc.setFont("helvetica", "italic");
      doc.text("Myopia Diagnosis System", pageWidth - margin - 40, 10);
    }

    // Save PDF with formatted name
    const patientName = selectedDiagnosis.retinalImageId?.patientId?.name.replace(/\s+/g, "-") || "Unknown";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    doc.save(`myopia-report-${patientName}-${dateStr}.pdf`);
    showToast("Report downloaded successfully", "success");
  } catch (error) {
    console.error("PDF generation error:", error);
    showToast("Failed to generate report", "error");
  } finally {
    setIsGeneratingReport(false);
  }
};

  // Fetch diagnosis on mount
  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        await getDiagnosis(diagnosisId);
      } catch (error) {
        showToast("Failed to load diagnosis", "error");
        navigate("/doctor/diagnoses");
      }
    };
    fetchDiagnosis();
  }, [diagnosisId, getDiagnosis, showToast, navigate]);

  // Handle recommendation generation
  const handleGenerateRecommendation = async () => {
    setIsGenerating(true);
    try {
      await generateRecommendation(diagnosisId);
    } catch (error) {
      // Error handled by diagnosisStore
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter recommendations for this diagnosis
  const diagnosisRecommendations = recommendations.filter(
    (rec) => rec.diagnosisId === diagnosisId
  );

  if (!selectedDiagnosis) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="bg-indigo-700 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/doctor/diagnoses")}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
            title="Back to Diagnoses"
            aria-label="Back to Diagnoses"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Diagnosis Details</h1>
            <div className="flex items-center mt-1 text-indigo-100">
              <User size={16} className="mr-1" />
              <p>
                Patient: {selectedDiagnosis.retinalImageId?.patientId?.name || "Unknown"} 
                <span className="mx-2">•</span>
                <Calendar size={16} className="inline mr-1" />
                {formatDate(selectedDiagnosis.diagnosedAt)}
                <span className="mx-2">•</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                    selectedDiagnosis.severityLevel
                  )}`}
                >
                  {selectedDiagnosis.severityLevel?.toUpperCase() || "UNKNOWN"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("images")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "images"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Eye className="mr-2 h-5 w-5" />
              Images
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Activity className="mr-2 h-5 w-5" />
              Diagnosis Details
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "recommendations"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="mr-2 h-5 w-5" />
              AI Recommendations
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-indigo-500" />
                  Original Retinal Image
                </h2>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <img
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${selectedDiagnosis.retinalImageId.originalImagePath}?t=${Date.now()}`}
                    alt="Original retinal image"
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>
              </div>
              
              {/* YOLO Output Image */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                  YOLO Detection Image
                </h2>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {selectedDiagnosis.retinalImageId.yoloOutputPath ? (
                    <img
                      src={`https://collinz56-myopia-yolo.hf.space/static/${selectedDiagnosis.retinalImageId.yoloOutputPath.split("/").pop()}?t=${Date.now()}`}
                      alt="YOLO output image"
                      className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                      onError={(e) => {
                        console.error("Failed to load YOLO output image:", {
                          yoloOutputPath: selectedDiagnosis.retinalImageId.yoloOutputPath,
                          attemptedUrl: e.target.src,
                        });
                        e.target.src = "/placeholder.png";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[60vh] bg-gray-100 rounded-lg">
                      <p className="text-gray-400 italic">No YOLO output available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* Severity and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-indigo-500" />
                  Severity Assessment
                </h2>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-4 py-2 rounded-lg text-base font-medium ${getSeverityColor(
                      selectedDiagnosis.severityLevel
                    )}`}
                  >
                    {selectedDiagnosis.severityLevel?.toUpperCase() || "UNKNOWN"}
                  </span>
                  <span className="text-gray-600">
                    Diagnosed on {formatDate(selectedDiagnosis.diagnosedAt)}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mt-6 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-indigo-500" />
                  Clinical Notes
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[150px]">
                  <p className="whitespace-pre-line text-gray-800">
                    {selectedDiagnosis.notes || "No notes provided for this diagnosis."}
                  </p>
                </div>
              </div>

              {/* YOLO Detections */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                  YOLO Detection Results
                </h2>
                {selectedDiagnosis.yoloDetections.length > 0 ? (
                  <div className="overflow-y-auto max-h-[400px] bg-gray-50 rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-indigo-50 text-indigo-800">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">Label</th>
                          <th className="py-3 px-4 text-left font-semibold">Confidence</th>
                          <th className="py-3 px-4 text-left font-semibold">Bounding Box</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDiagnosis.yoloDetections.map((detection, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="py-3 px-4 text-gray-700 font-medium">{detection.label}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-indigo-500 h-2 rounded-full"
                                    style={{ width: `${detection.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-700">{(detection.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                              x: {detection.boundingBox.x.toFixed(2)}, y: {detection.boundingBox.y.toFixed(2)},
                              w: {detection.boundingBox.width.toFixed(2)}, h: {detection.boundingBox.height.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-400 italic">No detections available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-indigo-500" />
                AI Treatment Recommendations
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateRecommendation}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-sm disabled:opacity-50 hover:scale-105 transform"
                  disabled={isLoading || isGenerating}
                  aria-label="Generate AI Recommendation"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isGenerating ? "Generating..." : "Generate Recommendation"}
                  </span>
                </button>
                <button
                  onClick={generateReport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-sm disabled:opacity-50 hover:scale-105 transform"
                  disabled={isLoading || isGeneratingReport}
                  aria-label="Generate PDF Report"
                >
                  {isGeneratingReport ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isGeneratingReport ? "Generating..." : "Generate Report"}
                  </span>
                </button>
              </div>
            </div>

            {diagnosisRecommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-lg">No recommendations generated yet</p>
                <p className="text-gray-500 mt-2 max-w-md">
                  Click the "Generate Recommendation" button above to get AI-powered treatment suggestions based on the diagnosis.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {diagnosisRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{rec.recommendationText}</p>
                    <p className="text-xs text-gray-500 mt-4 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Generated on {formatDate(rec.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisDetails;