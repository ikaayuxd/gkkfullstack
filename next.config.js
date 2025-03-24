/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: "mongodb+srv://xaayux:909090xd@cluster0.mojpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    MONGODB_DB: "gumasta_krishi_kendra"
  }
}

module.exports = nextConfig
