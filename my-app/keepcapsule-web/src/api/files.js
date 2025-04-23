const API_BASE = "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod";

export async function uploadFileToBackend(file, email) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", email);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function getFilesFromBackend(email) {
  const res = await fetch(`${API_BASE}/files?email=${email}`);
  return res.json();
}
