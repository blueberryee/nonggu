# 직관 캘린더

## 처음 한 번만
1. GitHub에서 새 저장소(Public)를 만들어요. 이름 예: `zikgwan`
2. 이 폴더의 파일을 전부 올려요 (`index.html`, `scores.json`, `scripts/`, `.github/`, `raw/`).
   - 웹에서 "Add file > Upload files"로 폴더째 끌어 놓으면 돼요.
   - `.github` 폴더는 이름이 점으로 시작해서 안 보일 수 있어요. 보이는 대로 같이 올려 주세요.
3. Settings > Pages > Source를 "Deploy from a branch", Branch를 `main` / `(root)`로 저장해요.
4. Settings > Actions > General > Workflow permissions를 "Read and write permissions"로 바꿔요.
5. Actions 탭에서 `fetch-scores`를 골라 "Run workflow"를 눌러요.
6. 끝나면 저장소의 `raw/probe.json`을 열어서 내용을 복사해 Claude에게 보내 주세요.
7. 앱 주소는 `https://<내 아이디>.github.io/<저장소 이름>/` 이에요.

## 폰에서 쓰기 전에
- 기존 링크의 기록은 새 주소에서 보이지 않아요. 기존 링크 설정 탭에서 "내보내기"로 백업 텍스트를 복사한 뒤, 새 주소 설정 탭의 "가져오기"에 붙여 넣으세요.
