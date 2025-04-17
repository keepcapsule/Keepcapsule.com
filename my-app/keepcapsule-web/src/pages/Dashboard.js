import React, { useState, useEffect } from "react";

const Dashboard = ({ user, onLogout }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Load user's files from localStorage (mock DB)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(user.email)) || {};
    setUploadedFiles(stored.files || []);
  }, [user.email]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

    const newFiles = [...uploadedFiles, ...fileNames];

    // Update localStorage (mock save)
    localStorage.setItem(user.email, JSON.stringify({ files: newFiles }));

    setUploadedFiles(newFiles);
  };

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.email}</h2>

      <div style={styles.uploadBox}>
        <h3>Upload a File</h3>
        <input type="file" multiple onChange={handleFileUpload} />
      </div>

      <div style={styles.fileList}>
        <h3>Uploaded Files ({uploadedFiles.length})</h3>
        {uploadedFiles.length > 0 ? (
          <ul>
            {uploadedFiles.map((file, idx) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>

      <button onClick={onLogout} style={styles.logoutBtn}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
  },
  uploadBox: {
    marginBottom: "30px",
  },
  fileList: {
    marginBottom: "30px",
  },
  logoutBtn: {
    backgroundColor: "#2d89ef",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Dashboard;
