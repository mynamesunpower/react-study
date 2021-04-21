import Joi from '@hapi/joi';
import User from '../../models/user';

/*
  POST /api/auth/register
  {
    username: 'verlopert',
    password: 'mypass123'
  }
 */
export const register = async (ctx) => {
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  // 회원가입
  const { username, password } = ctx.request.body;
  try {
    // username이 이미 존재하는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 디비 저장

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    // 사용자 토큰을 쿠키에 담는다.
    // 토큰을 사용할 때는 주로 두 가지 방법이 있다.
    // 브라우저의 localStorage나 sessionStorage에 담아서 사용하는 방법,
    // 브라우저의 쿠키에 담아서 사용하는 방법.
    // 두 가지 모두 장단점이 존재.
    // storage는 사용하기 편리하고 구현도 쉽지만, XSS(cross site scripting) 공격으로 토큰이 탈취당할 가능성이 있다.
    // cookie는 httpOnly 속성으로 자바스크립트를 통해 쿠키 조회가 불가능하므로 악성 스크립트에 안전하나,
    // 반면 CSRF(cross site request forgery) 공격에 취약해질 수 있다.
    // 이것은 토큰을 쿠키에 담으면 사용자가 서버에 요청할 때마다 토큰이 함께 전달되는 것을 이용해
    // 사용자가 모르게 원하지 않는 API 요청을 ㅏㅎ게 만든다.
    // CSRF는 CSRF 토큰 사용 및 Referer 검증 등의 방식으로 제대로 막을 수 있음.
    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  POST /api/auth/login
  {
    username: 'sunny'
    password: 'pass1234'
  }
 */
export const login = async (ctx) => {
  const { username, password } = ctx.request.body;

  // username, password가 없으면 에러 처리.
  if (!username || !password) {
    ctx.status = 401; // Unauthorized;
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // 계정이 존재하지 않으면 에러 처리
    if (!user) {
      ctx.status = 401;
      return;
    }

    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호인지 체크
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/auth/check
 */
export const check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    // 로그인 중 아님
    ctx.status = 401; // Unauthorized;
    return;
  }

  ctx.body = user;
};

/*
  POST /api/auth/logout
 */
export const logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No Content
};
