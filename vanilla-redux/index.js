import { createStore } from "redux";

const divToggle = document.querySelector(".toggle");
const counter = document.querySelector("h1");
const btnIncrease = document.querySelector("#increase");
const btnDecrease = document.querySelector("#decrease");

// 액션 이름 정의
const TOGGLE_SWITCH = "TOGGLE_SWITCH";
const INCREASE = "INCREASE";
const DECREASE = "DECREASE";

// 액션 생성 함수
const toggleSwitch = () => ({ type: TOGGLE_SWITCH });
const increase = (difference) => ({ type: INCREASE, difference });
const decrease = () => ({ type: DECREASE });

// 초기값 설정
const initialState = {
  toggle: false,
  counter: 0,
};

// 리듀서 함수 정의
// reducer -> 변화를 일으키는 함수.
// @param state, action

// state가 undefined라면 initialState 사용
function reducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SWITCH:
      return {
        ...state, // 불변성 유지
        toggle: !state.toggle,
      };
    case INCREASE:
      return {
        ...state,
        counter: state.counter + action.difference,
      };
    case DECREASE:
      return {
        ...state,
        counter: state.counter - 1,
      };
    default:
      return state;
  }
}

// 스토어 만들기.
const store = createStore(reducer);

// render() 만들기 ; react의 render와 다름.
const render = () => {
  const state = store.getState(); // 현재 상태값
  // 토글 처리
  if (state.toggle) {
    divToggle.classList.add("active");
  } else {
    divToggle.classList.remove("active");
  }

  // 카운터 처리
  counter.innerText = state.counter;
};

render();

// 구독하기 ; 스토어의 상태가 바뀔 때마다 render()가 호출되도록.
store.subscribe(render);

// 액션 발생시키기
divToggle.onclick = () => {
  store.dispatch(toggleSwitch());
};
btnIncrease.onclick = () => {
  store.dispatch(increase(1));
};
btnDecrease.onclick = () => {
  store.dispatch(decrease());
};

// 리덕스의 3가지 규칙
/*
  1. 단일 스토어
  하나의 어플리케이션 안에 하나의 스토어.
  여러 개의 스토어가 불가능한 것은 아님. 단, 상태 관리가 빡빡해진다.

  2. 읽기 전용 상태 read-only state
  기존 리액트에서 setState로 state를 업데이트할 때도 불변성을 지키기 위해
  ... 연산자나 immer 라이브러리를 사용함.
  상태를 업데이트할 때는 기존 객체를 건드리지 않고 새로운 객체를 생성해 주어야 한다.
  -> 그 이유는 내부적으로 데이터가 변경되는 것을 감지하기 위해 얕은 비교 검사를 하기 때문.
  객체의 변화를 감지할 때 겉핥기 식으로 비교하여 좋은 성능을 유지하는 것.

  3. reducer() 는 순수 함수여야 한다.
  -> 이전 상태와 액션 객체를 파라미터로 받는다.
  -> 파라미터 이외의 값에 의존하면 안된다.
  -> 이전 상태는 절대 건드리지 않고, 변화를 준 새로운 상태 객체를 만들어서 반환.
  -> 똑같은 파라미터로 호출된 리듀서는 언제나 똑같은 결과를 반환.
*/
