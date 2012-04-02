class AddIconIdToEntities < ActiveRecord::Migration
  def self.up
    add_column :entities, :icon_id, :integer
  end

  def self.down
    remove_column :entities, :icon_id, :integer
  end
end
