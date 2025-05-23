import React, { useEffect, useState } from "react";
import { compressAndUploadFile } from "../utils/compressAndUpload";

const Dashboard = ({ user, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [storageUsedMB, setStorageUsedMB] = useState(0);

  const maxMB = 5120;

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fetch(
          `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/files?email=${user.email}`
        );
        const data = await res.json();
        setFiles(data.files || []);
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
        const usedMB = (data.usedBytes / (1024 * 1024)).toFixed(2);
        setStorageUsedMB(usedMB);
      } catch (err) {
        console.error("Error loading storage usage:", err.message);
      }
    };

    loadFiles();
    loadUsage();
  }, [user.email]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (storageUsedMB > maxMB) {
      alert("Storage limit exceeded. Please upgrade.");
      return;
    }

    for (const file of selectedFiles) {
      const uploaded = await compressAndUploadFile(file, user.email);
      if (uploaded.success) {
        setFiles((prev) => [...prev, uploaded.filename]);
      } else {
        alert("Failed to upload: " + uploaded.message);
      }
    }
    setSelectedFiles([]);
  };

  const handleDelete = async (filename) => {
    const res = await fetch(
      `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/files?email=${user.email}&filename=${filename}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f !== filename));
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

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.email}</h2>

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
            <>You’ve used {storageUsedMB}MB of 5120MB. You’re almost full!</>
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
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <button type="submit" style={styles.uploadBtn}>
          Upload
        </button>
      </form>

      <div style={styles.grid}>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          files.map((filename, i) => (
            <div key={i} style={styles.card}>
              {filename.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={`https://keepcapsulestack-keepcapsulebucket68cb5041-baq4fianccuy.s3.eu-west-1.amazonaws.com/${user.email}/${filename}`}
                  alt={filename}
                  style={styles.image}
                />
              ) : (
                <p>{filename}</p>
              )}
              <button
                onClick={() => handleDelete(filename)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <button onClick={onLogout} style={styles.logout}>
        Logout
      </button>

      {user.email === "admin@keepcapsule.com" && (
        <button onClick={handleResetUsage} style={styles.reset}>
          🧼 Reset Usage
        </button>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: 5,
  },
  deleteBtn: {
    marginTop: 10,
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
};

export default Dashboard;
