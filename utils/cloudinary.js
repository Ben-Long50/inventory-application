import { v2 as cloudinary } from 'cloudinary';

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: 'dm4tmla72',
  api_key: '158547294753538',
  api_secret: 'n6NdX8ShPogZ0_z5KyS4dfCSeq8',
  secure: true,
});

export default cloudinary;
