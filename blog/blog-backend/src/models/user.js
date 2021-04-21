import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// instance method
// function 키워드로 만들어야 함. 인스턴스를 가리켜야 해서 this가 필요하므로.
// 여기의 this는 UserSchema 인스턴스.
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};
UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};
UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣는다.
    {
      _id: this.id,
      username: this.username,
    },
    // 두 번째 파라미터에는 JWT 암호를 넣는다.
    process.env.JWT_SECRET,
    // 세 번째 파라미터에는 유효 기간 설정
    {
      expiresIn: '7d', // 7일 동안 유효
    },
  );
  return token;
};

// static method
UserSchema.statics.findByUsername = function (username) {
  // 여기서의 this는 모델을 가리킴. 여기서는 User
  return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;
