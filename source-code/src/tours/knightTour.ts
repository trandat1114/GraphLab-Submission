import type { Tour } from "./types";

/**
 * Knight's shortest path walkthrough.
 * Same six-part structure as graphTour.ts: goal -> UI tour -> guided demo ->
 * step-by-step, beginner-friendly explanation -> summary. See AGENT.md.
 */
export const knightTour: Tour = {
  key: "knight",
  title: "Knight's shortest path",
  steps: [
    {
      popover: {
        title: "Mục tiêu của bài toán",
        description:
          "Trên bàn cờ 8×8, quân mã chỉ di chuyển theo hình chữ L. Câu hỏi: từ ô xuất phát đến ô đích, cần " +
          "<b>ít nhất bao nhiêu nước đi</b>? Nghe khác bài toán đồ thị, nhưng thực chất vẫn là một bài toán tìm " +
          "đường đi ngắn nhất — chỉ khác là \"đỉnh\" bây giờ là các ô cờ, và \"cạnh\" là những nước nhảy hợp lệ " +
          "của quân mã.",
      },
    },
    {
      element: "#tour-knight-squares",
      popover: {
        title: "Khu vực 1 — Ô xuất phát và ô đích",
        description:
          "Chọn ô Start và Target bằng ký hiệu cờ vua quen thuộc (cột a–h, hàng 1–8), ví dụ a1 và h8. Bấm " +
          "<b>Random squares</b> nếu muốn GraphLab tự chọn ngẫu nhiên một cặp ô để thử.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-knight-board",
      popover: {
        title: "Khu vực 2 — Bàn cờ",
        description:
          "Mỗi ô vuông đóng vai trò một đỉnh. Hai ô được coi là \"nối với nhau\" nếu quân mã nhảy trực tiếp được " +
          "từ ô này sang ô kia. Vì <b>mọi nước đi đều có giá trị như nhau</b> (không có nước nào \"tốn\" hơn nước " +
          "nào), đây là một đồ thị không trọng số — và đó chính là lúc BFS phát huy tác dụng.",
        side: "right", align: "start",
      },
    },
    {
      element: "#tour-knight-legend",
      popover: {
        title: "Chú giải màu sắc",
        description:
          "<b>Vàng (Current)</b>: ô đang xét. <b>Xanh ngọc (Visited)</b>: ô đã xử lý xong. <b>Tím (In queue)</b>: " +
          "ô đã phát hiện, đang chờ tới lượt. <b>Xanh sáng (Shortest path)</b>: các ô trên đường đi ngắn nhất, " +
          "hiện ra kèm số thứ tự nước đi sau khi tìm xong.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-knight-controls",
      popover: {
        title: "Hãy thử: từ a1 đến h8",
        description:
          "Đặt Start = a1, Target = h8, rồi bấm <b>→</b> vài lần để xem BFS lần lượt \"khám phá\" các ô theo từng " +
          "lớp nước đi: trước hết là mọi ô cách 1 nước, rồi 2 nước, v.v. Bấm <b>Play trace</b> để chạy tự động — " +
          "dùng nút tốc độ (1×/2×/4×/8×) để tua nhanh, vì bàn cờ 8×8 có thể sinh ra hàng trăm bước nhỏ.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-knight-queue",
      popover: {
        title: "Khu vực 3 — Hàng đợi (Queue)",
        description:
          "Danh sách các ô đã phát hiện nhưng chưa xử lý, xếp theo đúng thứ tự phát hiện (vào trước ra trước). " +
          "Vì BFS luôn lấy ô <b>vào hàng đợi sớm nhất</b> ra xử lý trước, các ô gần Start luôn được xử lý trước " +
          "các ô xa hơn.",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-knight-visited",
      popover: {
        title: "Ô đã xử lý xong",
        description:
          "Một ô vào đây nghĩa là BFS đã xét xong cả 8 nước đi chữ L có thể từ ô đó. Mỗi ô chỉ được xử lý đúng " +
          "một lần, dù bàn cờ có 64 ô — đó là lý do bài toán này giải cực nhanh.",
        side: "left", align: "start",
      },
    },
    {
      element: "#tour-knight-result",
      popover: {
        title: "Kết quả cuối cùng",
        description:
          "Đường đi và số nước đi tối thiểu hiện ở đây, kèm thứ tự từng ô trên đường đi. Vì BFS duyệt theo từng " +
          "lớp, <b>ô đích được chạm tới lần đầu tiên chính là bằng đúng số nước đi ít nhất</b> — không cần so " +
          "sánh thêm với phương án nào khác.",
        side: "top", align: "start",
      },
    },
    {
      element: "#tour-knight-summary",
      popover: {
        title: "Tổng kết",
        description:
          "Dù đổi từ \"đỉnh và cạnh\" sang \"ô cờ và nước nhảy chữ L\", thuật toán không hề đổi: vẫn là BFS — lấy " +
          "phần tử đầu hàng đợi, xét các ô kề chưa thăm, đẩy chúng vào cuối hàng đợi. Đây chính là điều làm BFS " +
          "hữu ích: một thuật toán, áp dụng được cho nhiều bài toán tưởng chừng rất khác nhau, miễn là bạn mô tả " +
          "được bài toán đó dưới dạng đỉnh và cạnh.",
        side: "top", align: "start",
      },
    },
  ],
};
