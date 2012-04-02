class AddIncidentNameToIcons < ActiveRecord::Migration
  def self.up
    add_column :icons, :incident_name, :string
  end

  def self.down
    remove_column :icons, :incident_name
  end
end
