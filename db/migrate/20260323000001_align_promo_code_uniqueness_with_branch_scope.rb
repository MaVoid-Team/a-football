class AlignPromoCodeUniquenessWithBranchScope < ActiveRecord::Migration[8.1]
  def change
    return unless table_exists?(:promo_codes)

    if index_exists?(:promo_codes, :code, unique: true)
      remove_index :promo_codes, column: :code
    end

    unless index_exists?(:promo_codes, [:branch_id, :code], unique: true, name: "index_promo_codes_on_branch_id_and_code")
      add_index :promo_codes, [:branch_id, :code], unique: true, name: "index_promo_codes_on_branch_id_and_code"
    end
  end
end
