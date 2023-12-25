defmodule App.Orders.Order do
  use Ecto.Schema
  import Ecto.Changeset

  @mail_regex ~r/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/

  @required_fields ~w(valid_until customer_name customer_email)a
  @optional_fields ~w(customer_phone status)a

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "orders" do
    field :status, Ecto.Enum, values: [:pending, :paid, :expired, :cancelled], default: :pending
    field :valid_until, :utc_datetime
    field :customer_name, :string
    field :customer_email, :string
    field :customer_phone, :string
    field :product_name, :string
    field :product_variant_name, :string
    field :discount_name, :string
    field :discount_value, :integer
    field :sub_total, :integer
    field :total, :integer
    field :confirm, :boolean, virtual: true

    belongs_to :user, App.Users.User
    belongs_to :product, App.Products.Product
    belongs_to :product_variant, App.Products.Variant

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(order, attrs) do
    order
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  def create_changeset(order, attrs) do
    order
    |> changeset(attrs)
    |> validate_acceptance(:confirm)
    |> validate_format(:customer_email, @mail_regex)
    |> validate_product(attrs)
    # need to be after validate_product
    |> validate_product_variant(attrs)
  end

  defp validate_product(changeset, attrs) do
    case Map.get(attrs, "product") do
      nil ->
        add_error(changeset, :product, "can't be blank")

      product ->
        product = product |> App.Repo.preload(:user)

        changeset
        |> put_assoc(:user, product.user)
        |> put_assoc(:product, product)
        |> put_change(:product_name, product.name)
        |> put_change(:sub_total, product.price)
        |> put_change(:total, product.price)
    end
  end

  defp validate_product_variant(changeset, attrs) do
    case Map.get(attrs, "product_variant") do
      nil ->
        changeset

      variant ->
        changeset
        |> put_assoc(:product_variant, variant)
        |> put_change(:product_variant_name, variant.name)
        |> put_change(:sub_total, variant.price)
        |> put_change(:total, variant.price)
    end
  end
end