import React, { useEffect, useState } from "react";
import { compressAndUploadFile } from "../utils/compressAndUpload";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ user, onLogout }) => {
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadType, setUploadType] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [storageUsedMB, setStorageUsedMB] = useState(0);
  const [breakdown, setBreakdown] = useState({ photosMB: 0, documentsMB: 0 });
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  const maxMB = 5120;

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fetch(
          `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/files?email=${user.email}`
        );
        const data = await res.json();
        const photoFiles = data.files.filter((f) => f.type === "photo");
        const docFiles = data.files.filter((f) => f.type === "document");
        setPhotos(photoFiles);
        setDocuments(docFiles);
      } catch (err) {
        console.error("Error loading files:", err.message);
      }
    };

    const loadUsage = async () => {
      try {
        const res = await fetch(
          `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/usage?email=${user.email}`
        );
        const data = await res.json();
        setStorageUsedMB((data.usedBytes / (1024 * 1024)).toFixed(2));
      } catch (err) {
        console.error("Error loading usage:", err.message);
      }
    };

    const loadBreakdown = async () => {
      try {
        const res = await fetch(
          `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/breakdown?email=${user.email}`
        );
        const data = await res.json();
        setBreakdown(data);
      } catch (err) {
        console.error("Error loading breakdown:", err.message);
      }
    };

    loadFiles();
    loadUsage();
    loadBreakdown();
  }, [user.email]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadType || !uploadTitle.trim()) {
      alert("Please select a type and enter a title before uploading.");
      return;
    }

    if (storageUsedMB > maxMB) {
      alert("Storage limit exceeded. Please upgrade.");
      return;
    }

    for (const file of selectedFiles) {
      const uploaded = await compressAndUploadFile(
        file,
        user.email,
        uploadTitle
      );
      if (uploaded.success) {
        const newFile = { filename: uploaded.filename, title: uploadTitle };
        if (uploadType === "photo") {
          setPhotos((prev) => [...prev, newFile]);
        } else {
          setDocuments((prev) => [...prev, newFile]);
        }
      } else {
        alert("Failed to upload: " + uploaded.message);
      }
    }
    setSelectedFiles([]);
    setUploadType("");
    setUploadTitle("");
  };

  const handleDelete = async (filename) => {
    const res = await fetch(
      `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/files?email=${user.email}&filename=${filename}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setPhotos((prev) => prev.filter((f) => f.filename !== filename));
      setDocuments((prev) => prev.filter((f) => f.filename !== filename));
    } else {
      alert("Failed to delete");
    }
  };

  const handleResetUsage = async () => {
    const res = await fetch(
      `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/reset-usage?email=${user.email}`
    );
    const data = await res.json();
    alert(data.message || "Reset done");
    window.location.reload();
  };

  const chartData = {
    labels: [
      `Photos (${photos.length}) - ${breakdown.photosMB}MB`,
      `Documents (${documents.length}) - ${breakdown.documentsMB}MB`,
    ],
    datasets: [
      {
        data: [breakdown.photosMB, breakdown.documentsMB],
        backgroundColor: ["#2d89ef", "#ffb74d"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.email}</h2>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("upload")}
          style={{
            ...styles.tab,
            ...(activeTab === "upload" && styles.activeTab),
          }}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          style={{
            ...styles.tab,
            ...(activeTab === "photos" && styles.activeTab),
          }}
        >
          Photos
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          style={{
            ...styles.tab,
            ...(activeTab === "documents" && styles.activeTab),
          }}
        >
          Documents
        </button>
      </div>

      {activeTab === "upload" && (
        <>
          {storageUsedMB > 4500 && (
            <div style={styles.warning}>
              {storageUsedMB > 5120 ? (
                <>
                  <strong>Storage limit exceeded.</strong>
                  <br />
                  You’ve used {storageUsedMB}MB of 5120MB.
                  <br />
                  Please upgrade to continue uploading.
                </>
              ) : (
                <>
                  You’ve used {storageUsedMB}MB of 5120MB. You’re almost full!
                </>
              )}
              <br />
              <button
                onClick={() =>
                  (window.location.href =
                    "https://buy.stripe.com/fZeeWFd3ubxp0iQ3cc")
                }
                style={styles.upgrade}
              >
                Upgrade to 20GB
              </button>
            </div>
          )}

          <form onSubmit={handleUpload} style={styles.uploadBox}>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileChange}
            />
            <input
              type="text"
              placeholder="Enter title for this file"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              style={{ marginTop: 10, padding: 6, width: 300 }}
            />
            <div style={{ marginTop: 10 }}>
              <label>
                <input
                  type="radio"
                  name="uploadType"
                  value="photo"
                  checked={uploadType === "photo"}
                  onChange={() => setUploadType("photo")}
                />
                Photo
              </label>
              <label style={{ marginLeft: 20 }}>
                <input
                  type="radio"
                  name="uploadType"
                  value="document"
                  checked={uploadType === "document"}
                  onChange={() => setUploadType("document")}
                />
                Document
              </label>
            </div>
            <button type="submit" style={styles.uploadBtn}>
              Upload
            </button>
          </form>

          <div style={styles.chartContainer}>
            <Pie data={chartData} />
          </div>
        </>
      )}

      {activeTab === "photos" && (
        <div style={styles.grid}>
          {photos.length === 0 ? (
            <p>No photos uploaded yet.</p>
          ) : (
            photos.map((file, i) => (
              <div key={i} style={styles.card}>
                <img
                  src={`https://keepcapsulestack-keepcapsulebucket68cb5041-baq4fianccuy.s3.eu-west-1.amazonaws.com/${
                    user.email
                  }/${file.filename}?t=${Date.now()}`}
                  alt={file.title || file.filename}
                  style={styles.image}
                  onClick={() => setLightboxImage(file.filename)}
                />
                <p style={styles.titleText}>{file.title}</p>

                <button
                  onClick={() => handleDelete(file.filename)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div style={styles.grid}>
          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            documents.map((file, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.docIcon}>📄</div>
                <p style={{ marginTop: 5 }}>{file.title}</p>
                <button
                  onClick={() => handleDelete(file.filename)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={onLogout} style={styles.logout}>
        Logout
      </button>

      {user.email === "admin@keepcapsule.com" && (
        <button onClick={handleResetUsage} style={styles.reset}>
          🧼 Reset Usage
        </button>
      )}

      {lightboxImage && (
        <div style={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <img
            src={`https://keepcapsulestack-keepcapsulebucket68cb5041-baq4fianccuy.s3.eu-west-1.amazonaws.com/${user.email}/${lightboxImage}`}
            alt="preview"
            style={styles.lightboxImg}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  tab: {
    padding: "10px 30px",
    backgroundColor: "#e0e0e0",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  activeTab: {
    backgroundColor: "#2d89ef",
    color: "#fff",
  },
  uploadBox: { marginBottom: 30 },
  uploadBtn: {
    marginTop: 10,
    padding: "10px 20px",
    backgroundColor: "#2d89ef",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  warning: {
    backgroundColor: "#fffbe5",
    border: "1px solid #ffcc00",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  upgrade: {
    marginTop: 10,
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  chartContainer: {
    margin: "30px auto",
    maxWidth: 300,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: 30,
  },
  card: {
    width: 160,
    backgroundColor: "#fff",
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 230,
  },

  image: {
    width: "100%",
    height: 100,
    objectFit: "contain",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 8,
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "30px",
    marginBottom: 30,
  },

  titleText: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  docIcon: { fontSize: 48 },
  deleteBtn: {
    marginTop: 5,
    backgroundColor: "#ff6b6b",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: 5,
    cursor: "pointer",
  },
  logout: {
    marginTop: 40,
    backgroundColor: "#2d89ef",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  reset: {
    marginTop: 10,
    backgroundColor: "#cccccc",
    color: "#333",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  lightbox: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lightboxImg: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "8px",
  },
};

export default Dashboard;
