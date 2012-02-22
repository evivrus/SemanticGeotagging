class AddImageToComments < ActiveRecord::Migration
  def self.up
    change_table :comments do |t|
      t.has_attached_file :image
    end
  end

  def self.down
    drop_attached_file :comments, :image
  end
end
