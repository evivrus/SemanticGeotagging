class Entity < ActiveRecord::Base
  has_many :comments
  has_many :resps
  belongs_to :icon
#  validates_presence_of :title
end
