// 캔버스 설정
const canvas = document.getElementById("orbitCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 원 데이터 구조
const circles = [];
const maxCircles = 10;

// 컨트롤 요소
const circleSelect = document.getElementById("circleSelect");
const radiusControl = document.getElementById("radiusControl");
const orbitControl = document.getElementById("orbitControl");
const colorControl = document.getElementById("colorControl");

// 클릭 시 원 추가 또는 이동
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 현재 선택된 원의 인덱스 확인
  const selectedIndex = parseInt(circleSelect.value, 10);

  if (!isNaN(selectedIndex) && circles[selectedIndex]) {
    // 선택된 원이 있다면 좌표를 이동
    circles[selectedIndex].centerX = x;
    circles[selectedIndex].centerY = y;
  } else if (circles.length < maxCircles) {
    // 선택된 원이 없고, 최대 개수를 초과하지 않았다면 새 원 추가
    const newCircle = {
      centerX: x,
      centerY: y,
      orbitRadius: 150,
      circleRadius: 120,
      angle: 0,
      speed: Math.random() * 0.03 + 0.01,
      color: "#ff0000",
      opacity: 0.5,
    };

    circles.push(newCircle);
    updateCircleSelect();
  }

  updateCircleController(); // 컨트롤러 업데이트
});

// 선택된 원 속성 업데이트
function updateCircleAttributes() {
  const selectedIndex = parseInt(circleSelect.value, 10);
  if (isNaN(selectedIndex) || !circles[selectedIndex]) return;

  const selectedCircle = circles[selectedIndex];
  selectedCircle.circleRadius = parseInt(radiusControl.value, 10);
  selectedCircle.orbitRadius = parseInt(orbitControl.value, 10);
  selectedCircle.color = colorControl.value;
}

// 선택 변경 시 컨트롤러 값 반영
circleSelect.addEventListener("change", () => {
  const selectedIndex = parseInt(circleSelect.value, 10);
  if (isNaN(selectedIndex) || !circles[selectedIndex]) return;

  const selectedCircle = circles[selectedIndex];
  radiusControl.value = selectedCircle.circleRadius;
  orbitControl.value = selectedCircle.orbitRadius;
  colorControl.value = selectedCircle.color;
});

// 슬라이더 및 컬러 변경 이벤트
radiusControl.addEventListener("input", updateCircleAttributes);
orbitControl.addEventListener("input", updateCircleAttributes);
colorControl.addEventListener("input", updateCircleAttributes);

radiusControl.addEventListener("input", () => {
  const selectedIndex = parseInt(circleSelect.value, 10);
  if (!isNaN(selectedIndex) && circles[selectedIndex]) {
    circles[selectedIndex].circleRadius = parseInt(radiusControl.value, 10);
  }
});

orbitControl.addEventListener("input", () => {
  const selectedIndex = parseInt(circleSelect.value, 10);
  if (!isNaN(selectedIndex) && circles[selectedIndex]) {
    circles[selectedIndex].orbitRadius = parseInt(orbitControl.value, 10);
  }
});

// 원 목록 업데이트
function updateCircleSelect() {
  circleSelect.innerHTML = "";

  // "None" 옵션 추가
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "None (Add new circle)";
  circleSelect.appendChild(noneOption);

  // 원 목록 추가
  circles.forEach((circle, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `Circle ${index + 1}`;
    circleSelect.appendChild(option);
  });

  circleSelect.value = ""; // 기본적으로 "None" 선택
}

let isPaused = false; // 애니메이션 상태를 나타내는 변수

// 스페이스바 이벤트 핸들러
document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    // 스페이스바 확인
    event.preventDefault();
    isPaused = !isPaused; // 일시정지 상태를 토글
  }
});

const circleInfo = document.getElementById("circleInfo");

// 컨트롤러 업데이트 함수
function updateCircleController() {
  circleInfo.innerHTML = ""; // 기존 컨트롤러 내용을 초기화

  circles.forEach((circle, index) => {
    const circleContainer = document.createElement("div");
    circleContainer.style.marginBottom = "10px";

    // 타이틀
    const title = document.createElement("label");
    title.textContent = `Circle ${index + 1}`;
    circleContainer.appendChild(title);

    // X 좌표 입력 필드
    const xInput = document.createElement("input");
    xInput.type = "number";
    xInput.value = circle.centerX;
    xInput.addEventListener("input", () => {
      circle.centerX = parseInt(xInput.value, 10);
    });
    circleContainer.appendChild(document.createTextNode(" X: "));
    circleContainer.appendChild(xInput);

    circleContainer.appendChild(document.createElement("br"));

    // Y 좌표 입력 필드
    const yInput = document.createElement("input");
    yInput.type = "number";
    yInput.value = circle.centerY;
    yInput.addEventListener("input", () => {
      circle.centerY = parseInt(yInput.value, 10);
    });
    circleContainer.appendChild(document.createTextNode(" Y: "));
    circleContainer.appendChild(yInput);

    // 컨트롤러에 추가
    circleInfo.appendChild(circleContainer);
  });
}

const gridSpacing = 10; // 격자 간격
const gridColor = "#555"; // 격자 색상

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존 캔버스 클리어
  ctx.beginPath();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;

  // 수직선 그리기
  for (let x = 0; x <= canvas.width; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }

  // 수평선 그리기
  for (let y = 0; y <= canvas.height; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }

  ctx.stroke();
  ctx.closePath();
}

// 애니메이션 루프
function animate() {
  if (!isPaused) {
    drawGrid(); // 그리드 먼저 그리기
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      // 궤도 그리기
      ctx.beginPath();
      ctx.arc(
        circle.centerX,
        circle.centerY,
        circle.orbitRadius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = "white";
      ctx.stroke();

      // 회전하는 원 위치 계산
      const x = circle.centerX + circle.orbitRadius * Math.cos(circle.angle);
      const y = circle.centerY + circle.orbitRadius * Math.sin(circle.angle);

      // 중심점 그리기
      ctx.fillStyle = "red";
      ctx.fillRect(circle.centerX, circle.centerY, 1, 1);

      // 회전하는 원 그리기
      ctx.beginPath();
      ctx.arc(x, y, circle.circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = `${circle.color}${Math.floor(circle.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.globalAlpha = circle.opacity;
      ctx.fill();

      // 각도 업데이트
      circle.angle += circle.speed;
    });

    ctx.globalAlpha = 1; // 투명도 초기화
  }

  requestAnimationFrame(animate); // 다음 프레임 요청
}

updateCircleController();

animate(); // 애니메이션 시작
