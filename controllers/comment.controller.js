const commentService = require('../services/comment.service');

class CommentController {
  // Tạo comment mới
  async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const { task_id, content } = req.body;
      const comment = await commentService.createComment({ task_id, user_id: userId, content });
      
      res.status(201).json({
        success: true,
        message: 'Tạo comment thành công',
        data: comment
      });
    } catch (error) {
      console.error('❌ Comment create error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy comments của task
  async getByTask(req, res) {
    try {
      const { taskId } = req.params;
      const comments = await commentService.getCommentsByTask(taskId);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      console.error('❌ Comment getByTask error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy comment theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const comment = await commentService.getCommentById(id);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment không tồn tại'
        });
      }
      
      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('❌ Comment getById error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật comment
  async update(req, res) {
    try {
      console.log('🚀 Vào hàm update comment');
      const { id } = req.params;
      const userId = req.user?.id;
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      console.log('id người dùng bạn muốn comment là: ', userId)

      const updatedComment = await commentService.updateComment(id, { content }, userId);
      
      if (!updatedComment) {
        return res.status(404).json({
          success: false,
          message: 'Comment không tồn tại hoặc bạn không có quyền chỉnh sửa'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật comment thành công',
        data: updatedComment
      });
    } catch (error) {
      console.error('❌ Comment update error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa comment
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const deleted = await commentService.deleteComment(id, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Comment không tồn tại hoặc bạn không có quyền xóa'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa comment thành công'
      });
    } catch (error) {
      console.error('❌ Comment delete error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy comments của user
  async getByUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const comments = await commentService.getCommentsByUser(userId);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      console.error('❌ Comment getByUser error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CommentController();
