pragma solidity ^0.6.9;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
//import "../contracts/console-log.sol";

contract starNotary is ERC721 {
    
    constructor() public ERC721("starNotary", "STAR") {}

    // Create a structure which holds the star information
    struct Star {
        string name;
        // in future we can add other attributes like star coordinates, story of the star etc.
    }

    // To store the tokenId of the Star as the Key and the Star details as the Value.
    // This is going to make it easy for us to look up any star using it's tokenId.
    mapping(uint256 => Star) public tokenIdToStarInfo;
    
    // To store star's that are up for sale (On a sale).
    // TokenId as the Key and Selling price of the Star as the Value.
    mapping(uint256 => uint256) public starsForSale;

    // To create a new star
    function createStar(string memory _name, uint256 _tokenId) public {
        // Create a star object.
        Star memory newStar = Star(_name);
        // Add star into tokenIdToStarInfo map.
        tokenIdToStarInfo[_tokenId] = newStar;
        // mints new tokens by adding one token to the msg.sender
        _mint(msg.sender, _tokenId);
    }

    // To put a star on sale
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        // first check the owner of tokenId (star)
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the star you don't owned.");
        // Add the token(star) into starForSale map along with it's selling cost
        starsForSale[_tokenId] = _price;
    }

    // To buy the star - this function is payable as we are expecting the funds to come through for transaction
    function buyStar(uint256 _tokenId) public payable {
        // Check if token (star) is up for sale
        require(starsForSale[_tokenId] > 0, "The star should be up for sale");

        // get the star selling cost
        uint256 starSellingCost = starsForSale[_tokenId];
        // get the address of owner
        address ownerAddress = ownerOf(_tokenId);
        // Check if buyer has sent enough ether to buy the star       
        require(msg.value >= starSellingCost, "You need to have enough Ether");
        
        // to safely transfer the star from owner to buyer
        safeTransferFrom(ownerAddress, msg.sender, _tokenId);

        // transer the ether from buyer to owner
        //address payable ownerAddressPayable = _make_payable(msg.sender);
        //ownerAddressPayable.transfer(starSellingCost);
        
        payable(msg.sender).transfer(starSellingCost);

        if(msg.value > starSellingCost) {
            msg.sender.transfer(msg.value - starSellingCost);
        }

    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

}