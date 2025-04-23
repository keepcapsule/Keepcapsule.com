const BASE_URL = "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod";

export const getFiles = async () => {
  try {
    const res = await fetch(`${BASE_URL}/files`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching files:", err);
    return [];
  }
};
