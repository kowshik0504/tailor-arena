const mongoose = require('mongoose');
const dns = require('dns').promises;
const { Resolver } = require('dns').promises;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Handle SRV resolution failure (common in some local networks)
    if (uri.startsWith('mongodb+srv://')) {
      try {
        // Test if SRV can be resolved normally
        const host = uri.split('@')[1].split('/')[0].split('?')[0];
        await dns.resolveSrv(`_mongodb._tcp.${host}`);
      } catch (dnsError) {
        console.log('Default DNS failed to resolve SRV. Attempting Google DNS fallback...');
        try {
          const host = uri.split('@')[1].split('/')[0].split('?')[0];
          const resolver = new Resolver();
          resolver.setServers(['8.8.8.8', '8.8.4.4']);
          const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
          
          // Convert SRV records to standard mongodb format
          const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
          const authPart = uri.split('@')[0].replace('mongodb+srv://', 'mongodb://');
          const remainingPart = uri.split('@')[1].split('/');
          const dbAndQuery = remainingPart.slice(1).join('/');
          
          uri = `${authPart}@${hosts}/${dbAndQuery}${dbAndQuery.includes('?') ? '&' : '?'}tls=true&authSource=admin`;
          console.log('Successfully resolved SRV using fallback DNS.');
        } catch (fallbackError) {
          console.error('DNS Fallback also failed:', fallbackError.message);
          // Continue with original URI and let mongoose try its best
        }
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
