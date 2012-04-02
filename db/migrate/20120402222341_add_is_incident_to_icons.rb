class AddIsIncidentToIcons < ActiveRecord::Migration
  def self.up
    add_column :icons, :is_incident, :boolean
  end

  def self.down
    remove_column :icons, :is_incident
  end
end
