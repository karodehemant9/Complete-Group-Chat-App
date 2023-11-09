const User = require('../models/user');
const Message = require('../models/message');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
require('dotenv').config();



exports.sendMessage = async (req, res) => {
  if (isNaN(parseInt(req.user.id))) {
    return res.status(400).json({ error: 'Invalid user Id' });
  }

  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const message = req.body.message;
    const data = await Message.create({ text: message, userId: req.user.id, groupId: req.body.activeGroupId });
    const user = await User.findOne({ where: { id: req.user.id } });
    return res.status(200).json({ success: true, message: "Message sent successfully", sentMessage: { data, user } });
  } catch (err) {
    console.log("Error storing message");
    return res.status(500).json({ success: false, error: err });
  }
}



exports.getMessage = async (req, res) => {
  if (isNaN(parseInt(req.params.groupId))) {
    return res.status(400).json({ error: 'Invalid group Id' });
  }
  try {
    const totalMessages = await Message.count({ where: { groupId: req.params.groupId } });
    const messagesToRetrieve = 100;

    const messages = await Message.findAll({
      where: { groupId: req.params.groupId },
      include: [{ model: User, attribute: ['name'] }],
      offset: Math.max(totalMessages - messagesToRetrieve, 0),
      limit: messagesToRetrieve
    });
    return res.status(200).json({ success: true, allMessage: messages });
  } catch (err) {
    return res.status(500).json({ success: false, error: err })
  }
}





exports.uploadFile = async (req, res) => {
  if (isNaN(parseInt(req.body.activeGroupId))) {
    return res.status(400).json({ error: 'Invalid group Id' });
  }
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: `Please choose file !` });
    }

    let type = (req.file.mimetype.split('/'))[1];
    console.log('type', type)
    const file = req.file.buffer;
    const filename = `GroupChat/${new Date()}.${type}`;
    console.log(`file ===>`, file);
    console.log('filename ====>', filename);
    const fileUrl = await uploadToS3(file, filename);
    console.log('fileUrl =============>', fileUrl);

    if (!fileUrl.includes("https://expense-tracker123")) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }
    let result = await req.user.createMessage({ text: fileUrl, groupId: req.body.activeGroupId })
    const user = await User.findOne({ where: { id: req.user.id } })
    return res.status(200).json({ success: true, message: "file uploaded successfully", fileUrl, sentMessage: { data: result, user } })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, message: `Something went wrong !` });
  }
}




function uploadToS3(data, filename) {
  return new Promise((resolve, reject) => {
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    const IAM_USER_KEY = process.env.AWS_IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.AWS_IAM_USER_SECRET;

    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    })


    var params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read' //making your files publically visible
    }

    s3bucket.upload(params, (err, s3response) => {
      try {
        if (err) {
          console.log("Error uploading file", err);
          reject(err);
        } else {
          console.log('File uploaded successfully', s3response)
          resolve(s3response.Location);
        }
      } catch (err) {
        console.log("Waiting to login in AWS for upload", err)
      }
    })
  });
}
