import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String], // 문자열로 이루어진 배열
  publishedDate: {
    type: Date,
    default: Date.now, // 현재 날짜를 기본값으로 지정
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

// Schema 에서 지원하는 타입
/*
  String : 문자열
  Number : 숫자
  Date : 날짜
  Buffer : 파일을 담을 수 있는 버퍼
  Boolean : true / false
  Mixed(Schema.Types.Mixed) : 어떤 데이터도 넣을 수 있는 형식
  ObjectId(Schema.Types.ObjectId) : 객체 아이디. 주로 다른 객체를 참조할 때 넣음
  Array : 배열 형태의 값으로 []로 감싸서 사용
*/

// model(1st, 2nd) : SchemaName, SchemaObject
const Post = mongoose.model('Post', PostSchema);
export default Post;
