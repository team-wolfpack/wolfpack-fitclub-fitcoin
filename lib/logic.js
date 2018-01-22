/**
 * A member can receive points for different activities
 * @param {org.fitclub.fitcoin.ReceiveFitCoins} receiveFitCoins - the points being received
 * @transaction
 * 
 * A member can only receive points if they are currently active
 * A member can receive points for activities such as using the treadmill, playing raquetball, swimming, or attending a class
 */

function receiveFitCoins (receiveFitCoins) {
    var member = receiveFitCoins.member;
    var fitCoinsReceived = receiveFitCoins.fitCoinQuantity;
    var memberStatus = member.memberStatus;

    console.log('Member; ' + member.personFirstName + ' ' + member.personLastName + ' received ' + fitCoinsReceived.toString());

    if (memberStatus === 'ACTIVE') {
        member.fitCoinBalance+=fitCoinsReceived;
        console.log('Member is active');
    } else {
    		console.log('Member is inactive');
    }
    
    console.log('Member balance is now ' + member.fitCoinBalance);

    return getParticipantRegistry('org.fitclub.fitcoin.Member')
    .then(function (memberRegistry) {
        // update the member's fitcoin balance
        return memberRegistry.update(member);
    });

}

/**
 * A member can redeem FitCoins for merchandise or services
 * @param {org.fitclub.fitcoin.RedeemFitCoins} redeemFitCoins - the FitCoins redeemed
 * @transaction
 * 
 * A member can only redeem FitCoins if they have sufficient balance in their account and they are active
 */

function redeemFitCoins (redeemFitCoins) {
    var member = redeemFitCoins.member;
    var storeOwner = redeemFitCoins.storeOwner;
    var fitCoinsBeingRedeemed = redeemFitCoins.fitCoinQuantity;
    var memberStatus = member.memberStatus;
    var memberPointBalance = member.fitCoinBalance;
	
    console.log('Member; ' + member.personFirstName + ' ' + member.personLastName + ' is redeeming ' + fitCoinsBeingRedeemed.toString());

    if (memberStatus === 'ACTIVE') {
        console.log('Member is active');
        if (memberPointBalance >= fitCoinsBeingRedeemed) {
        		console.log('Member has sufficient points');
        		member.fitCoinBalance-=fitCoinsBeingRedeemed;
                storeOwner.fitCoinBalance+=fitCoinsBeingRedeemed;
        } else {
        		console.log('Member has insufficient points');
                throw new Error('Member has insufficient FitCoins');
        }
    } else {
    		console.log('Member is inactive');
            throw new Error('Member is inactive');
    }
    
    console.log('Member balance is now ' + member.fitCoinBalance);

    return getParticipantRegistry('org.fitclub.fitcoin.Member')
    .then(function (memberRegistry) {
        // update the member's FitCoin balance
        return memberRegistry.update(member);
    })
    .then(function () {
            return getParticipantRegistry('org.fitclub.fitcoin.StoreOwner');
    })
	.then(function(storeOwnerRegistry) {
        // update the store owner's FitCoin balance
      	return storeOwnerRegistry.update(storeOwner);
    });
}

/**
 * Add a new club
 * @param {org.fitclub.fitcoin.AddClub} club - the member being added
 * @transaction
 * 
 * A club is added to the registry and associated to the clubOwner
 */

function addClub (club) {
	
    return getParticipantRegistry('org.fitclub.fitcoin.Club')
    .then(function (clubRegistry) {
        var factory = getFactory();
        // Create the bond asset.
        var newClub = factory.newResource('org.fitclub.fitcoin', 'Club', club.clubId);
        newClub.clubName = club.clubName;
        newClub.clubOwner = factory.newRelationship('org.fitclub.fitcoin','ClubOwner', club.clubOwner);
        // Add the bond asset to the registry.
        return clubRegistry.add(newClub);
    });
}

/**
 * Add a new member
 * @param {org.fitclub.fitcoin.AddClubOwner} clubOwner - the member being added
 * @transaction
 * 
 * A clubOwner is added to the registry 
 */

function addClubOwner (clubOwner) {
	
    return getParticipantRegistry('org.fitclub.fitcoin.ClubOwner')
    .then(function (clubOwnerRegistry) {
        var factory = getFactory();
        // Create the ClubOwner.
        var newClubOwner = factory.newResource('org.fitclub.fitcoin', 'ClubOwner', clubOwner.clubOwnerId);
        newClubOwner.personFirstName = clubOwner.clubOwnerFirstName;
        newClubOwner.personLastName = clubOwner.clubOwnerLastName;
        // Add the ClubOwner to the registry.
        return clubOwnerRegistry.add(newClubOwner);
    });
}

/**
 * Add a new member
 * @param {org.fitclub.fitcoin.AddMember} member - the member being added
 * @transaction
 * 
 * A member is added to the registry and seeded with 100 FitCoins and their status is set to Active
 */

function addMember (member) {
	
    return getParticipantRegistry('org.fitclub.fitcoin.Member')
    .then(function (memberRegistry) {
        var factory = getFactory();
        // Create the bond asset.
        var newMember = factory.newResource('org.fitclub.fitcoin', 'Member', member.memberId);
        newMember.personFirstName = member.memberFirstName;
        newMember.personLastName = member.memberLastName;
        newMember.fitCoinBalance = 100;
        newMember.memberStatus = 'ACTIVE';
        newMember.club = factory.newRelationship('org.fitclub.fitcoin','Club', member.club);
        // Add the bond asset to the registry.
        return memberRegistry.add(newMember);
    });
}

/**
 * Add a new store owner
 * @param {org.fitclub.fitcoin.AddStoreOwner} storeOwner - the store owner being added
 * @transaction
 * 
 * A store owner is added to the registry
 */

function addStoreOwner (storeOwner) {
	
    return getParticipantRegistry('org.fitclub.fitcoin.StoreOwner')
    .then(function (storeOwnerRegistry) {
        var factory = getFactory();
        // Create the bond asset.
        var newStoreOwner = factory.newResource('org.fitclub.fitcoin', 'StoreOwner', storeOwner.storeOwnerId);
        newStoreOwner.personFirstName = storeOwner.storeOwnerFirstName;
        newStoreOwner.personLastName = storeOwner.storeOwnerLastName;
        newStoreOwner.storeName = storeOwner.storeName;
        newStoreOwner.fitCoinBalance = 0;
        newStoreOwner.club = factory.newRelationship('org.fitclub.fitcoin','Club', storeOwner.club);
        // Add the bond asset to the registry.
        return storeOwnerRegistry.add(newStoreOwner);
    });
}

/**
 * Inactivate a member
 * @param {org.fitclub.fitcoin.InactivateMember} inactiveMember - the member being inactivated
 * @transaction
 * 
 * A member's status is set to 'INACTIVE'
 */

function inactivateMember (inactiveMember) {
	var member = inactiveMember.member;
	member.memberStatus = 'INACTIVE';
	
    return getParticipantRegistry('org.fitclub.fitcoin.Member')
    .then(function (memberRegistry) {
        return memberRegistry.update(member);
    });
}
