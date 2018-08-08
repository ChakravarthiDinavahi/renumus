class CreateFares < ActiveRecord::Migration[5.2]
  def change
    create_table :fares do |t|
      t.string :cost

      t.timestamps
    end
  end
end
