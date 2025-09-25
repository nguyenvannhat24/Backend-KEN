const boardRepo = require('../repositories/board.repository');

class BoardService {
  async listBoardsForUser(userId) {
    const memberships = await boardRepo.findMembersByUser(userId);
    const memberBoardIds = memberships.map(m => m.board_id);
    const createdBoards = await boardRepo.findByCreator(userId);
    const allBoardIds = new Set([
      ...memberBoardIds.map(id => String(id)),
      ...createdBoards.map(b => String(b._id))
    ]);
    if (allBoardIds.size === 0) return [];
    return boardRepo.findByIds(Array.from(allBoardIds));
  }

  async createBoard({ title, description, center_id, created_by }) {
    if (!title || !created_by) {
      throw new Error('title và created_by là bắt buộc');
    }
    return boardRepo.create({ title, description, center_id, created_by });
  }

  async getBoardIfPermitted(boardId, userId) {
    const board = await boardRepo.findById(boardId);
    if (!board) return null;
    const permitted = (String(board.created_by) === String(userId)) || await boardRepo.isMember(userId, boardId);
    return permitted ? board : 'forbidden';
  }

  async updateBoard(boardId, updateData, userId) {
    const board = await this.getBoardIfPermitted(boardId, userId);
    if (board === null) return null;
    if (board === 'forbidden') throw new Error('FORBIDDEN');
    const allowed = {};
    if (typeof updateData.title === 'string') allowed.title = updateData.title;
    if (typeof updateData.description === 'string') allowed.description = updateData.description;
    if (updateData.center_id) allowed.center_id = updateData.center_id;
    return boardRepo.updateById(boardId, allowed);
  }

  async deleteBoard(boardId, userId) {
    const isCreator = await boardRepo.isCreator(userId, boardId);
    if (!isCreator) throw new Error('FORBIDDEN');
    return boardRepo.deleteById(boardId);
  }
}

module.exports = new BoardService();


