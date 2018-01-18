/**
 * A member can receive points for different activities
 * @param {org.fitclub.rewards.ReceivePoints} receivePoints - the points being received
 * @transaction
 * 
 * A member can only receive points if they are currently active
 * A member can receive points for activities such as using the treadmill, playing raquetball, swimming, or attending a class
 */

function receivePoints (receivePoints) {
    var member = receivePoints.member;
    var pointsReceived = receivePoints.pointChange;
    var memberStatus = member.memberStatus;

    console.log('Member; ' + member.personFirstName + ' ' + member.personLastName + ' received ' + pointsReceived.toString());

    if (memberStatus === 'ACTIVE') {
        member.rewardsPointsBalance+=pointsReceived;
        console.log('Member is active');
    } else {
    		console.log('Member is inactive');
    }
    
    console.log('Member balance is now ' + member.rewardsPointsBalance);

    return getParticipantRegistry('org.fitclub.rewards.Member')
    .then(function (memberRegistry) {
        // update the member's rewards point balance
        return memberRegistry.update(member);
    });

}

/**
 * A member can redeem points for merchandise or services
 * @param {org.fitclub.rewards.RedeemPoints} redeemPoints - the points being redeemed
 * @transaction
 * 
 * A member can only redeem points if they have sufficient balance in their account and they are active
 */

function redeemPoints (redeemPoints) {
    var member = redeemPoints.member;
    var pointsBeingRedeemed = redeemPoints.pointChange;
    var memberStatus = member.memberStatus;
    var memberPointBalance = member.rewardsPointsBalance;
	
    console.log('Member; ' + member.personFirstName + ' ' + member.personLastName + ' is redeeming ' + pointsBeingRedeemed.toString());

    if (memberStatus === 'ACTIVE') {
        console.log('Member is active');
        if (memberPointBalance >= pointsBeingRedeemed) {
        		console.log('Member has sufficient points');
        		member.rewardsPointsBalance-=pointsBeingRedeemed;
        } else {
        		console.log('Member has insufficient points');
        }
    } else {
    		console.log('Member is inactive');
    }
    
    console.log('Member balance is now ' + member.rewardsPointsBalance);

    return getParticipantRegistry('org.fitclub.rewards.Member')
    .then(function (memberRegistry) {
        // update the member's rewards point balance
        return memberRegistry.update(member);
    });

}

/**
 * Add a new member
 * @param {org.fitclub.rewards.AddMember} member - the member being added
 * @transaction
 * 
 * A member is added to the registry and seeded with 100 FitCoins and their status is set to Active
 */

function addMember (member) {
	
    return getParticipantRegistry('org.fitclub.rewards.Member')
    .then(function (memberRegistry) {
        var factory = getFactory();
        // Create the bond asset.
        var newMember = factory.newResource('org.fitclub.rewards', 'Member', member.memberId);
        newMember.personFirstName = member.memberFirstName;
        newMember.personLastName = member.memberLastName;
        newMember.rewardsPointsBalance = 100;
        newMember.memberStatus = 'ACTIVE';
        newMember.clubId = factory.newRelationship('org.fitclub.rewards','Club', member.clubId);
        // Add the bond asset to the registry.
        return memberRegistry.add(newMember);
    });
}

/**
 * Inactivate a member
 * @param {org.fitclub.rewards.InactivateMember} inactiveMember - the member being inactivated
 * @transaction
 * 
 * A member's status is set to 'INACTIVE'
 */

function inactivateMember (inactiveMember) {
	var member = inactiveMember.member;
	member.memberStatus = 'INACTIVE';
	
    return getParticipantRegistry('org.fitclub.rewards.Member')
    .then(function (memberRegistry) {
        return memberRegistry.update(member);
    });
}
