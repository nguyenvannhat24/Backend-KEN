const commentRepo = require("../repositories/comment.repository");
const taskRepo = require("../repositories/task.repository");
const mongoose = require("mongoose");
const userRepo = require("../repositories/user.repository");
const { sendMailToUser } = require("../config/sendNotify");
const boardRepo = require("../repositories/board.repository");
class CommentService {
  // Tạo comment mới
  async createComment({ task_id, user_id, content }) {
    try {
      // Validate input
      if (!task_id || !user_id || !content) {
        throw new Error("task_id, user_id và content là bắt buộc");
      }

      if (!mongoose.Types.ObjectId.isValid(task_id)) {
        throw new Error("task_id không hợp lệ");
      }

      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new Error("user_id không hợp lệ");
      }

      if (content.trim() === "") {
        throw new Error("Nội dung comment không được để trống");
      }

      // Kiểm tra task tồn tại
      const task = await taskRepo.findById(task_id);
      if (!task) {
        throw new Error("Task không tồn tại");
      }

      const commentData = {
        task_id,
        user_id,
        content: content.trim(),
      };
      const comment = await commentRepo.create(commentData);
      const UserComment = await userRepo.findById(user_id);
      const full_name = UserComment.full_name;

      // tìm người được giao để gửi mail
      const taskComment = await taskRepo.findById(task_id);
      if (taskComment) {
        const idBoard = taskComment.board_id.toString();
        const board = await boardRepo.findById(idBoard);
        const idUser = taskComment.assigned_to?._id;
        const idString = idUser.toString() || "";
        if (idString != null) {
          const asignTo = await userRepo.findById(idUser);
          if (asignTo) {
            const subject = "Bạn vừa được ";
            const html = `
                          <h3>Xin chào!</h3>
                          <p> <b>${full_name} đã bình luận trong task bạn được giao</b>.</p>
                          <p><b>${full_name} đã bình luận</b> trong task :<b>${
              taskComment.title
            }</b> của bảng <b>${board.title}</b>
                          <p><b>${content.trim()} </b></b>
                          <p>Cảm ơn bạn đã đọc.</p>
                          <p>— CodeGym Team</p>
                        `;
            await sendMailToUser(idUser, subject, html);
          }
        }
      }

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Lấy comments của task
  async getCommentsByTask(taskId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new Error("ID task không hợp lệ");
      }

      // Kiểm tra task tồn tại
      const task = await taskRepo.findById(taskId);
      if (!task) {
        throw new Error("Task không tồn tại");
      }

      const comments = await commentRepo.findByTaskId(taskId);
      return comments;
    } catch (error) {
      throw error;
    }
  }

  // Lấy comment theo ID
  async getCommentById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID comment không hợp lệ");
      }

      const comment = await commentRepo.findById(id);
      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật comment
  async updateComment(id, updateData, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID comment không hợp lệ");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("user_id không hợp lệ");
      }

      // Validate input
      if (updateData.content && updateData.content.trim() === "") {
        throw new Error("Nội dung comment không được để trống");
      }

      // Kiểm tra comment tồn tại và user có quyền chỉnh sửa
      const existingComment = await commentRepo.findById(id);

      if (!existingComment) {
        throw new Error("Comment không tồn tại");
      }

      const commentUserId =
        typeof existingComment.user_id === "object"
          ? existingComment.user_id._id
          : existingComment.user_id;

      if (commentUserId.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa comment này");
      }

      const updatedComment = await commentRepo.update(id, updateData);
      return updatedComment;
    } catch (error) {
      throw error;
    }
  }

  // Xóa comment
  async deleteComment(id, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID comment không hợp lệ");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("user_id không hợp lệ");
      }

      // Kiểm tra comment tồn tại và user có quyền xóa
      const existingComment = await commentRepo.findById(id);
      if (!existingComment) {
        throw new Error("Comment không tồn tại");
      }

      const commentUserId =
        typeof existingComment.user_id === "object"
          ? existingComment.user_id._id
          : existingComment.user_id;

      if (commentUserId.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa comment này");
      }
      // Soft delete comment
      const deleted = await commentRepo.softDelete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // Lấy comments của user
  async getCommentsByUser(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("user_id không hợp lệ");
      }

      const comments = await commentRepo.findByUserId(userId);
      return comments;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CommentService();
