import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const FileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|pdf|doc|docx|xlsx|xls)$/)) {
    return callback(
      new BadRequestException(
        'Only JPG, JPEG, PDF, DOC, DOCX files are allowed!',
      ),
      false,
    );
  }

  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
