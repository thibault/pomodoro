define(['js/utils'], function(utils) {
    describe('prettifyTime', function() {
        it('should display a ms value in the mm:ss form', function() {
            expect(utils.prettifyTime(1000)).to.be.equal('00:01');
            expect(utils.prettifyTime(15000)).to.be.equal('00:15');
            expect(utils.prettifyTime(60000)).to.be.equal('01:00');
            expect(utils.prettifyTime(1500000)).to.be.equal('25:00');
            expect(utils.prettifyTime(1501000)).to.be.equal('25:01');
        });
    });

    describe('extractProject', function() {
        it('should return a string', function() {
            expect(utils.extractProject('@tinkiwinki is the best')).to.be.equal('tinkiwinki');
            expect(utils.extractProject('I do prefer @dipsy')).to.be.equal('dipsy');
            expect(utils.extractProject('bla bla bla @lala is my favorite')).to.be.equal('lala');
            expect(utils.extractProject('Watch out the punctuation @po!')).to.be.equal('po');
        });
        it('should return null if no project is found', function() {
            expect(utils.extractProject('There is no project here')).to.be.null;
            expect(utils.extractProject('')).to.be.null;

        });
        it('should return the fisrt found project', function() {
            expect(utils.extractProject('I think @lala and @tinkiwinki are frightening')).to.be.equal('lala');
            expect(utils.extractProject('@dipsy, @lala and @tinkiwinki are ugly')).to.be.equal('dipsy');
        });
    });

    describe('extractTags', function() {
        it('should return an array of strings', function() {
            expect(utils.extractTags('What a #great bunch of #tags we have')).to.be.eql(['great', 'tags']);
            expect(utils.extractTags('#tag1 yeah #tag2!')).to.be.eql(['tag1', 'tag2']);
        });

        it('should return an empty array if no tags were found', function() {
            expect(utils.extractTags('I hate tags.')).to.be.eql([]);
        });
    });
});

