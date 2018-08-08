require 'test_helper'

class FaresControllerTest < ActionDispatch::IntegrationTest
  setup do
    @fare = fares(:one)
  end

  test "should get index" do
    get fares_url
    assert_response :success
  end

  test "should get new" do
    get new_fare_url
    assert_response :success
  end

  test "should create fare" do
    assert_difference('Fare.count') do
      post fares_url, params: { fare: { cost: @fare.cost } }
    end

    assert_redirected_to fare_url(Fare.last)
  end

  test "should show fare" do
    get fare_url(@fare)
    assert_response :success
  end

  test "should get edit" do
    get edit_fare_url(@fare)
    assert_response :success
  end

  test "should update fare" do
    patch fare_url(@fare), params: { fare: { cost: @fare.cost } }
    assert_redirected_to fare_url(@fare)
  end

  test "should destroy fare" do
    assert_difference('Fare.count', -1) do
      delete fare_url(@fare)
    end

    assert_redirected_to fares_url
  end
end
