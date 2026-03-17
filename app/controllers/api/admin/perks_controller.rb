class Api::Admin::PerksController < Api::Admin::BaseController
  before_action :set_court
  before_action :set_perk, only: [:update, :destroy]

  def index
    @perks = policy_scope(@court.perks).ordered
    render json: PerkSerializer.new(@perks).serializable_hash
  end

  def create
    @perk = @court.perks.build(perk_params)
    authorize @perk
    @perk.position = @court.perks.maximum(:position) || 0

    if @perk.save
      render json: PerkSerializer.new(@perk).serializable_hash, status: :created
    else
      render json: { errors: @perk.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @perk
    if @perk.update(perk_params)
      render json: PerkSerializer.new(@perk).serializable_hash
    else
      render json: { errors: @perk.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @perk
    @perk.destroy
    head :no_content
  end

  def reorder
    authorize @court, :update?
    perk_orders = params.require(:perks).map(&:with_index)

    perk_orders.each do |perk_id, index|
      perk = @court.perks.find(perk_id)
      authorize perk
      perk.update!(position: index)
    end

    head :no_content
  end

  private

  def set_court
    @court = Court.find(params[:court_id])
  end

  def set_perk
    @perk = @court.perks.find(params[:id])
  end

  def perk_params
    params.require(:perk).permit(:name, :description, :active)
  end
end
