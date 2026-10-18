# GraphLab — Phòng thí nghiệm trực quan hóa thuật toán đồ thị

**Học phần:** CS112.F31.LT.TTNT — Phân tích và thiết kế thuật toán  
**Giảng viên:** Huỳnh Thị Thanh Thương

GraphLab là demo web cho bài toán tìm kiếm/đường đi trên đồ thị có trọng số. Người dùng chọn nguồn–đích, chuyển đổi đồ thị có hướng/vô hướng, thêm đỉnh/cạnh, chọn thuật toán và quan sát từng snapshot của thuật toán trên cùng một mô hình.

## Chức năng

- **BFS:** hàng đợi FIFO; đường tìm được ít cạnh nhất trong đồ thị không trọng số.
- **DFS:** ngăn xếp LIFO; đường tìm được phụ thuộc thứ tự duyệt và không đảm bảo tối ưu.
- **Dijkstra:** tìm đường đi ngắn nhất với trọng số không âm.
- **A\*:** dùng `f(n) = g(n) + h(n)`, với heuristic Euclid được co giãn để nhất quán với trọng số cạnh đang nhập.
- Điều khiển tiến/lùi từng bước, chạy tự động, tạm dừng và reset.
- Hiển thị đồ thị SVG, đỉnh hiện tại, visited, frontier, bảng khoảng cách hoặc `g/f`, cạnh đang xét, đường cuối cùng, tổng chi phí và số lần kiểm tra cạnh.
- Tùy chỉnh đỉnh nguồn/đích, hướng đồ thị; thêm đỉnh/cạnh, xóa cạnh cuối và khôi phục đồ thị mẫu.
- Kiểm tra input sai và từ chối cạnh âm khi dùng Dijkstra/A*.
- Có bộ testcase cố định, runner kiểm tra engine, báo cáo kết quả JSON và trace Dijkstra 34 snapshot sinh trực tiếp từ engine.
- Có `presentation.html`: slide deck web độc lập 8 trang, có điều hướng bàn phím, hiệu ứng cuộn và mô phỏng minh họa.

## Chạy ứng dụng React

Yêu cầu Node.js `>=20.19.0` và npm. Từ thư mục `source-code` (nơi chứa `package.json`):

```bash
npm install
npm run dev
```

Mở URL Vite in trong terminal (thường là `http://localhost:5173`). Build production bằng:

```bash
npm run build
npm run preview
```

## Chạy kiểm thử thuật toán

```bash
npm run test:engine
```

Runner biên dịch độc lập `source-code/src/graph.ts`, chạy 26 testcase cố định và đối chiếu Dijkstra/A* trên 100 đồ thị được sinh bằng seed cố định (200 phép so sánh) với Bellman–Ford độc lập. Kết quả của lượt chạy đã thực hiện khi đóng gói được lưu ở `testcases/last-run-results.json`; trace ví dụ được lưu ở `testcases/sample-dijkstra-trace.json`.

**Phạm vi xác minh:** 26/26 testcase và 200/200 phép đối chiếu ngẫu nhiên của engine đã đạt. Ở môi trường tạo gói này, yêu cầu npm tới registry thất bại do lỗi phân giải DNS (`EAI_AGAIN`), vì vậy `npm install`, `npm run build` toàn bộ React UI và kiểm thử trình duyệt chưa được xác nhận ở đây. Hãy chạy chúng trên máy có Internet trước khi nộp; checklist phân biệt rõ bước đã kiểm chứng và bước còn chờ.

## Bài thuyết trình tương tác

Mở `presentation.html` bằng trình duyệt hiện đại. Phím `←`/`→`, `Space`/`PageDown`, `PageUp`, `Home` và `End` điều khiển slide. Nút **Thử demo** chuyển đến slide mô phỏng; nút **Mở app React** mở `http://localhost:5173/` (cần khởi chạy app trước).

Mô phỏng trong slide deck là bản minh họa độc lập, không phải engine React. Không dùng slide deck làm bằng chứng thay cho video quay ứng dụng React thực tế.

## Cấu trúc gói nộp

```text
GraphLab-Submission/
├── README.md
├── presentation.html
├── source-code/       # ứng dụng React + TypeScript + Vite
├── testcases/         # 26 fixture, runner, kết quả và trace mẫu
└── report/            # Word và PDF
```

## Giới hạn đã biết

- App là demo học tập, không phải hệ thống định tuyến production.
- Tối đa 15 đỉnh trên mô hình giao diện hiện tại; chưa hỗ trợ kéo-thả vị trí, import/export đồ thị hoặc so sánh nhiều thuật toán song song.
- Dijkstra và A* dùng quét tuyến tính để chọn đỉnh/frontier, nên độ phức tạp của bản cài đặt là `O(V² + E)`, không phải cận `O((V + E) log V)` của phiên bản heap.
- Heuristic A* được co giãn theo cạnh để bảo toàn tính nhất quán, nhưng có thể trở nên yếu (đặc biệt khi có cạnh trọng số 0).
- Chưa có video quay ứng dụng React thật. Đây là một mục nộp còn thiếu và phải được bổ sung theo `video-demo/video-script.md` sau khi xác minh build trên máy có Internet.

## Tài liệu

- `report/report-source.md`: nguồn báo cáo có thể sửa.
- `report/report.docx`: bản Word.
- `report/tranphudat_report.pdf.pdf`: bản PDF đã render và kiểm tra bố cục.
- `video_demo.mp4`: Video mô tả về dự án và các thuật toán sử dụng.
