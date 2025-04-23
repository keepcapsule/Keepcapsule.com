import React, { useEffect, useState } from "react";
import { compressAndUploadFile } from "../utils/compressAndUpload";

const Dashboard = ({ user, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

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
    loadFiles();
  }, [user.email]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    for (const file of selectedFiles) {
      const uploaded = await compressAndUploadFile(file, user.email);
      if (uploaded.success) {
        setFiles((prev) => [...prev, uploaded.filename]);
      } else {
        alert("Failed to upload: " + uploaded.message);
      }
    }
    setSelectedFiles([]); // Clear selected files
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

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.email}</h2>

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
                  src={`https://keepcapsule-user-files.s3.eu-west-1.amazonaws.com/${user.email}/${filename}`}
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
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center",
  },
  uploadBox: {
    marginBottom: 30,
  },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "5px",
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#ff6b6b",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
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
};

export default Dashboard;
