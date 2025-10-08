const Column = require('../models/column.model');

class ColumnRepository {
  async create(data) {
    return await Column.create(data);
  }

  async findById(id) {
    return await Column.findById(id);
  }

  async findAllByBoard(boardId) {
    return await Column.find({ board_id: boardId }).sort({ order: 1 });
  }

  async update(id, data, session = null) {
    const options = { new: true };
    if (session) options.session = session;
    return await Column.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return await Column.findByIdAndDelete(id);
  }
  
  async insertMany(dataArray, session = null) {
    if (session) {
      return await Column.insertMany(dataArray, { session });
    }
    return await Column.insertMany(dataArray);
  }

  async deleteManyByBoard(boardId, session = null) {
    const query = Column.deleteMany({ board_id: boardId });
    return session ? query.session(session) : query;
  }

  async softDeleteManyByBoard(boardId, session = null) {
    const query = Column.updateMany(
      { board_id: boardId },
      { deleted_at: new Date() }
    );
    return session ? query.session(session) : query;
  }

  // ==================== SOFT DELETE METHODS ====================

  async softDelete(id) {
    try {
      return await Column.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error soft deleting column:', error);
      throw error;
    }
  }

  async findAllWithDeleted(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const query = {
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      };

      const [columns, total] = await Promise.all([
        Column.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Column.countDocuments(query)
      ]);

      return {
        columns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all columns with deleted:', error);
      throw error;
    }
  }

}

module.exports = new ColumnRepository();
