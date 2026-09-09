const mongoose = require('mongoose');
const TailorProfile = require('./models/TailorProfile');

async function test() {
  await mongoose.connect('mongodb+srv://tailorarena:tailorarena123@tailorarena.s4oqr3l.mongodb.net/tailorarena');
  const docs = await TailorProfile.find({ status: 'pending' }).select('documents');
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}

test();
