import type { Tour } from "./types";

/**
 * Graph playground walkthrough.
 * Content follows the lecturer brief in AGENT.md: goal -> UI tour -> guided demo ->
 * step-by-step, beginner-friendly explanation -> summary.
 */
export const graphTour: Tour = {
  key: "graph",
  title: "Graph playground",
  steps: [
    {
      popover: {
        title: "Mục tiêu của bài toán",
        description:
          "Chúng ta có một <b>đồ thị</b> gồm các đỉnh và các cạnh nối chúng. Câu hỏi đặt ra rất đơn giản: " +
          "đi từ đỉnh <b>xuất phát</b> đến đỉnh <b>đích</b> như thế nào? BFS, DFS, Dijkstra và A* là bốn cách " +
          "khác nhau để trả lời câu hỏi đó. Hướng dẫn này sẽ chỉ cho bạn thấy <b>quá trình</b> mỗi thuật toán " +
          "suy nghĩ, không chỉ đáp số cuối cùng.",
      },
    },
    {
      element: "#tour-graph-algolist",
      popover: {
        title: "Khu vực 1 — Chọn thuật toán",
        description:
          "Bốn thuật toán, bốn cách chọn \"đỉnh nào xét tiếp theo\": BFS dùng <b>hàng đợi</b> (vào trước ra trước), " +
          "DFS dùng <b>ngăn xếp</b> (vào sau ra trước), Dijkstra luôn chọn đỉnh có <b>khoảng cách tạm thời nhỏ nhất</b>, " +
          "A* chọn theo <b>f = g + h</b> (chi phí đã đi cộng ước lượng còn lại). Nói đơn giản: cùng một câu hỏi, " +
          "bốn chiến lược trả lời khác nhau.",
        side: "right", align: "start",
      },
    },
    {
      element: "#tour-graph-settings",
      popover: {
        title: "Khu vực 2 — Điểm xuất phát và đích",
        description:
          "<b>Start node</b> là nơi thuật toán bắt đầu, <b>Target node</b> là nơi cần đến. Đổi hai ô này để thử " +
          "nhiều tình huống trên cùng một đồ thị — đồ thị không đổi, chỉ đổi câu hỏi.",
        side: "right", align: "start",
      },
    },
    {
      element: "#tour-graph-canvas",
      popover: {
        title: "Khu vực 3 — Bàn vẽ đồ thị",
        description:
          "Mỗi vòng tròn là một <b>đỉnh</b>, mỗi đường nối là một <b>cạnh</b> có trọng số riêng. Màu của đỉnh cho " +
          "biết trạng thái ngay lúc này: đang được xét, đã xử lý xong, đang chờ trong hàng đợi/ngăn xếp, hoặc nằm " +
          "trên đường đi cuối cùng. Hãy quan sát màu sắc lan dần qua đồ thị khi bạn bước qua từng bước — đó chính " +
          "là cách thuật toán \"khám phá\" không gian tìm kiếm.",
        side: "right", align: "start",
      },
    },
    {
      element: "#tour-graph-legend",
      popover: {
        title: "Chú giải màu sắc",
        description:
          "<b>Vàng (Current)</b>: đỉnh đang được xét ngay lúc này. <b>Xanh ngọc (Visited)</b>: đỉnh đã xử lý xong. " +
          "<b>Tím (Frontier)</b>: đỉnh đã phát hiện nhưng chưa tới lượt xử lý. <b>Xanh sáng (Final path)</b>: đỉnh " +
          "thuộc đường đi kết quả, chỉ hiện sau khi thuật toán chạy xong.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-graph-stepcard",
      popover: {
        title: "Khu vực 4 — Thao tác hiện tại",
        description:
          "Mỗi bước, GraphLab mô tả bằng một câu ngắn gọn thuật toán vừa làm gì — ví dụ \"lấy đỉnh B ra khỏi hàng " +
          "đợi\" hay \"nới lỏng cạnh B → D\". Đọc câu này ở mỗi bước là cách nhanh nhất để hiểu thuật toán đang " +
          "\"nghĩ\" gì, thay vì chỉ nhìn kết quả cuối.",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-graph-controls",
      popover: {
        title: "Hãy thử: chạy Dijkstra từ A đến F",
        description:
          "Bây giờ đến lượt bạn. Chọn <b>Dijkstra</b>, đặt Start = A, Target = F, rồi bấm <b>→</b> vài lần để xem " +
          "khoảng cách tạm thời giảm dần mỗi khi có một cạnh được nới lỏng. Muốn xem toàn bộ quá trình tự động, " +
          "bấm <b>Play trace</b> — nút tốc độ bên cạnh (1×/2×/4×/8×) giúp tua nhanh khi đồ thị lớn. <b>Reset</b> " +
          "để chạy lại từ đầu bất cứ lúc nào.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-graph-frontier",
      popover: {
        title: "Khu vực 5 — Hàng đợi / ngăn xếp (Frontier)",
        description:
          "Đây là \"danh sách việc cần làm\" của thuật toán: các đỉnh đã được phát hiện nhưng chưa xử lý xong. " +
          "BFS lấy ra từ <b>đầu</b> danh sách, DFS lấy từ <b>cuối</b>, Dijkstra/A* luôn lấy phần tử <b>tốt nhất</b> " +
          "theo điểm số hiện có. Danh sách rỗng đồng nghĩa thuật toán đã duyệt hết phần đồ thị tới được.",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-graph-visited",
      popover: {
        title: "Đỉnh đã xử lý xong",
        description:
          "Một đỉnh vào danh sách này nghĩa là thuật toán đã xét xong mọi cạnh đi ra từ nó. Với BFS/DFS, một đỉnh " +
          "chỉ được xử lý đúng một lần — đó là lý do độ phức tạp của chúng chỉ là O(V + E).",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-graph-distances",
      popover: {
        title: "Bảng khoảng cách tạm thời",
        description:
          "<code>dist[v]</code> là khoảng cách <b>tốt nhất tìm được tới thời điểm hiện tại</b> từ Start đến đỉnh " +
          "v — con số này có thể giảm xuống khi thuật toán tìm ra một đường ngắn hơn, gọi là thao tác " +
          "<b>\"nới lỏng cạnh\" (relax)</b>. Với A*, cột f = g + h còn cộng thêm phần ước lượng để định hướng " +
          "tìm kiếm nhanh hơn.",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-graph-result",
      popover: {
        title: "Kết quả cuối cùng",
        description:
          "Khi chạy xong: đường đi tìm được, tổng chi phí, số đỉnh đã thăm và số lần kiểm tra cạnh đều hiện ở " +
          "đây. Ba con số cuối chính là \"hoá đơn chi phí\" để so sánh hiệu quả — chạy lại với một thuật toán " +
          "khác trên cùng Start/Target và so sánh chúng.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-graph-summary",
      popover: {
        title: "Tổng kết",
        description:
          "Bạn vừa thấy bốn cách trả lời cùng một câu hỏi \"đường đi từ Start đến Target là gì?\". BFS/DFS chỉ " +
          "đếm số cạnh, không quan tâm trọng số. Dijkstra cộng dồn trọng số để tìm tổng chi phí nhỏ nhất. A* làm " +
          "điều tương tự nhưng dùng heuristic để ưu tiên hướng tìm kiếm có triển vọng, thường duyệt ít đỉnh hơn. " +
          "Hãy đổi thuật toán, đổi Start/Target, và so sánh số bước — đó là cách tốt nhất để ghi nhớ sự khác biệt.",
        side: "top", align: "start",
      },
    },
  ],
};
