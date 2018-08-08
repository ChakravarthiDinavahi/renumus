require "application_system_test_case"

class FaresTest < ApplicationSystemTestCase
  setup do
    @fare = fares(:one)
  end

  test "visiting the index" do
    visit fares_url
    assert_selector "h1", text: "Fares"
  end

  test "creating a Fare" do
    visit fares_url
    click_on "New Fare"

    fill_in "Cost", with: @fare.cost
    click_on "Create Fare"

    assert_text "Fare was successfully created"
    click_on "Back"
  end

  test "updating a Fare" do
    visit fares_url
    click_on "Edit", match: :first

    fill_in "Cost", with: @fare.cost
    click_on "Update Fare"

    assert_text "Fare was successfully updated"
    click_on "Back"
  end

  test "destroying a Fare" do
    visit fares_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Fare was successfully destroyed"
  end
end
